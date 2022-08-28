#ifndef FULLCLASS_HEADER
#define FULLCLASS_HEADER

namespace A::B::C {


class FULL_CLASS {
 public:
  // constructor
  FULL_CLASS() = default;
  FULL_CLASS(const FULL_CLASS &) = default;
  // remember : && change ownership
  FULL_CLASS(FULL_CLASS &&) = default;
  // destructor
  virtual ~FULL_CLASS() = default;
  // assign operator
  auto operator=(const FULL_CLASS &) -> FULL_CLASS & = default;
  auto operator=(FULL_CLASS &&) -> FULL_CLASS & = default;
  // methods 
  virtual auto doSth() -> void = 0;
};

}

#endif /* FULLCLASS_HEADER */
