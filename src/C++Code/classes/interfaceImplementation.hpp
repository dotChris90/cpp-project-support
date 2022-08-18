#ifndef INTERFACE_HEADER
#define INTERFACE_HEADER

#include "A/B/C/interface.hpp";

namespace A::B::C {


class INTERFACE_IMP_CLASS : public INTERFACE_CLASS {
 public:
  virtual ~INTERFACE_IMP_CLASS() {};
  virtual void DoSth() = 0;
};

}

#endif /* INTERFACE_HEADER */