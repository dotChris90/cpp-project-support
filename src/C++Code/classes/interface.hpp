#ifndef INTERFACE_HEADER
#define INTERFACE_HEADER

namespace A::B::C {


class INTERFACE_CLASS {
 public:
 // constructor
  INTERFACE_CLASS() = default;
  INTERFACE_CLASS(const INTERFACE_CLASS &) = default;
  // remember : && change ownership
  INTERFACE_CLASS(INTERFACE_CLASS &&) = default;
  // destructor
  virtual ~INTERFACE_CLASS() = default;
  // assign operator
  auto operator=(const INTERFACE_CLASS &) -> INTERFACE_CLASS & = default;
  auto operator=(INTERFACE_CLASS &&) -> INTERFACE_CLASS & = default;
  // requires implementation
  virtual auto doSth() -> void = 0;
};

}

#endif /* INTERFACE_HEADER */