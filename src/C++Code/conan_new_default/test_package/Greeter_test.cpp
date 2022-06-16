
#include "Greeter.hpp"
#include "gtest/gtest.h"

// Demonstrate some basic assertions.
TEST(GreeterTest, BasicAssertions) {

  conan::Greeter greeter;
  EXPECT_STREQ(greeter.Greet("ABC!").c_str(), "Hello ABC!");
}

TEST(GreeterTest, MemoryLeak) {

  conan::Greeter greeter;
  greeter.DoMemoryLeak();
}
