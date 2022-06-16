#pragma once

#include <string>

namespace conan {
class Greeter {
private:
  /* data */
public:
  Greeter(/* args */) = default;
  ~Greeter() = default;
  std::string Greet(const std::string &name);
  void DoMemoryLeak();
};
} // namespace conan