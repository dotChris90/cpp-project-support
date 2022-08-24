#ifndef INTERFACE_HEADER
#define INTERFACE_HEADER

#include "A/B/C/interface.hpp"

namespace A::B::C {


class INTERFACE_IMP_CLASS : public INTERFACE_CLASS {
 public:
  INTERFACE_IMP_CLASS() = default;
  ~INTERFACE_IMP_CLASS() override = default;
  auto doSth() -> void override;
};

}

#endif /* INTERFACE_HEADER */
