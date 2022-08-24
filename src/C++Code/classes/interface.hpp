#ifndef INTERFACE_HEADER
#define INTERFACE_HEADER

namespace A::B::C {


class INTERFACE_CLASS {
 public:
  virtual ~INTERFACE_CLASS() = default;
  virtual auto doSth() -> void = 0;
};

}

#endif /* INTERFACE_HEADER */