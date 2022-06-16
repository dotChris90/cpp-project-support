
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
