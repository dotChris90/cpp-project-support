
#include "Greeter.hpp"
#include "fmt/core.h"

#include <vector>

namespace conan {

auto Greeter::Greet(const std::string &name) -> std::string {
  return fmt::format("Hello {}", name);
}

void Greeter::DoMemoryLeak() {
  auto vec = new std::vector<std::string>();
  vec->push_back("Hello");
  vec->push_back("World!");
}
} // namespace conan