
cmake_minimum_required(VERSION 3.1)
project(abc_test CXX)

include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup()

find_package(GTest REQUIRED)

enable_testing()

add_executable(pkg_test main.cpp 
                        Greeter_test.cpp
)
target_link_libraries(pkg_test  ${CONAN_LIBS}
                                  GTest::GTest
)

#//  GTest::gtest_main

include(GoogleTest)

gtest_discover_tests(pkg_test)
