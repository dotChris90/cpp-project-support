#ifndef INTERFACE_HEADER
#define INTERFACE_HEADER

namespace A::B::C {


class INTERFACE_CLASS {
 public:
  virtual ~INTERFACE_CLASS() {};
  virtual void DoSth() = 0;
};

}

#endif /* INTERFACE_HEADER */