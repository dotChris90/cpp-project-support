#ifndef CONAN_GREETER_
#define CONAN_GREETER_

#include <string>

/// @brief namespace conan
namespace conan {
/// @brief class greeter
class Greeter {
private:
  /* data */
public:
  Greeter(/* args */) = default;
  ~Greeter() = default;
  /// @brief Greet method
  /// @param name who to greet
  /// @return greeting string
  std::string Greet(const std::string &name);
  /// @brief do a memory leak
  void DoMemoryLeak();
};
} // namespace conan

#endif // CONAN_GREETER_