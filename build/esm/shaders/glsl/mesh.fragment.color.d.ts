declare const _default: "varying vec4 vColor;\n\nvec4 getColor() {\n  if (vColor.a <= 0.0) discard;\n  return vColor;\n}\n";
export default _default;
