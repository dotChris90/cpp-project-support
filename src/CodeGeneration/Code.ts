export class Code {
    static conanfilePy = `
from json import tool
from conans import ConanFile
from conans import tools
from conan.tools.cmake import CMakeToolchain, CMake, CMakeDeps
from conan.tools.layout import cmake_layout


class {{package_name}}Conan(ConanFile):

    name = "{{ name }}"
    version = "{{ version }}"

    # Optional metadata
    license = "<Put the package license here>"
    author = "<Put your name here> <And your email here>"
    url = "<Package recipe repository url here, for issues about the package>"
    description = "<Description of Abc here>"
    topics = ("<Put some tag here>", "<here>", "<and here>")

    # Binary configuration
    settings = "os", "compiler", "build_type", "arch"
    options = {"shared": [True, False], "fPIC": [True, False]}
    default_options = {"shared": False, "fPIC": True}

    # Sources are located in the same place as this recipe, copy them to the recipe
    exports_sources = "CMakeLists.txt", "src/*"

    def config_options(self):
        if self.settings.os == "Windows":
            del self.options.fPIC
    
    def requirements(self):
        self.requires("boost/1.75.0")
        self.requires("ms-gsl/4.0.0")

    def layout(self):
        cmake_layout(self)

    def generate(self):
        tc = CMakeToolchain(self)
        tc.generate()
        cmake = CMakeDeps(self)
        cmake.generate()

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()

    def package(self):
        cmake = CMake(self)
        cmake.install()

    def package_info(self):
        self.cpp_info.libs = tools.collect_libs(self)

`;
    static cMakeFile = `
cmake_minimum_required(VERSION 3.15)
project(abc CXX)

find_package(Boost REQUIRED COMPONENTS headers
)

add_executable(main     src/main.cpp
)

add_library(Hello       src/Greeter.cpp
)     

target_link_libraries(Hello Boost::headers
)

target_link_libraries(main Hello
)

set_target_properties(Hello PROPERTIES PUBLIC_HEADER "src/Greeter.hpp"
)

install(TARGETS main DESTINATION "."
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
)

install(TARGETS Hello DESTINATION "."
        PUBLIC_HEADER DESTINATION include
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
        )

`;
    static mainCpp = `
#include "Greeter.hpp"

int main() {
    conan::Greeter greet;
    greet.DoMemoryLeak();
    return 0;
}
`;
    static greeterHpp = `
#pragma once

#include <string>

namespace conan {
    class Greeter {
    private:
        /* data */
    public:
        Greeter(/* args */);
        ~Greeter();
        std::string Greet(const std::string& name);
        void DoMemoryLeak();
    };
}`;
    static greeterCpp = `
#include "Greeter.hpp"
#include "boost/format.hpp"

namespace conan
{
    Greeter::Greeter(/* args */) {
        
    }
    
    Greeter::~Greeter() {
        
    }
    
    std::string Greeter::Greet(const std::string& name) {
        return  (boost::format("Hello %1%") % name).str();
    }

    void Greeter::DoMemoryLeak() {
        auto vec = new std::vector<std::string*>();
        vec->push_back(new std::string("Hello"));
        vec->push_back(new std::string("World!"));
    }
}`;
    static testCMakeFile = `
cmake_minimum_required(VERSION 3.1)
project(abc_test CXX)

include(\${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup()

find_package(GTest REQUIRED)

enable_testing()

add_executable(pkg_test main.cpp 
                        Greeter_test.cpp
)
target_link_libraries(pkg_test  \${CONAN_LIBS}
                                  GTest::GTest
)

#//  GTest::gtest_main

include(GoogleTest)

gtest_discover_tests(pkg_test)
`;
    static testConanfile = `
import os

from conans import ConanFile, CMake, tools


class AbcTestConan(ConanFile):
    settings = "os", "compiler", "build_type", "arch"
    generators = "cmake", "cmake_find_package"
    requires = ["gtest/1.11.0"]

    def build(self):
        cmake = CMake(self)
        # Current dir is "test_package/build/<build_id>" and CMakeLists.txt is
        # in "test_package"
        cmake.configure()
        cmake.build()

    def imports(self):
        self.copy("*.dll", dst="bin", src="bin")
        self.copy("*.dylib*", dst="bin", src="lib")
        self.copy('*.so*', dst='bin', src='lib')

    def test(self):
        if not tools.cross_building(self):
            os.chdir("bin")
            if self.settings.build_type == "Debug":
                self.output.info("-----------------------------")
                self.output.info("|Skip Test because Debug ...|")
                self.output.info("-----------------------------")
            else:
                self.run(".%spkg_test" % os.sep)
        else: 
            self.output.info("-----------------------------------")
            self.output.info("|Skip Test because Cross build ...|")
            self.output.info("-----------------------------------")
`;
    static testGreeter = `
#include "gtest/gtest.h"
#include "Greeter.hpp"

// Demonstrate some basic assertions.
TEST(GreeterTest, BasicAssertions) {
  
  conan::Greeter greeter;
  EXPECT_STREQ(greeter.Greet("ABC!").c_str(),"Hello ABC!");

}

TEST(GreeterTest, MemoryLeak) {
  
  conan::Greeter greeter;
  greeter.DoMemoryLeak();
}
`;
    static testMain = `
#include "gtest/gtest.h"

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv); 
    return RUN_ALL_TESTS();
}
`;
};