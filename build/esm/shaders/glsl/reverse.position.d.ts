declare const _default: "uniform vec4 reverseScale;\nuniform vec4 reverseOffset;\n\nvec4 getReverseOffset(vec4 xyzw) {\n  return xyzw * reverseScale + reverseOffset;\n}";
export default _default;
