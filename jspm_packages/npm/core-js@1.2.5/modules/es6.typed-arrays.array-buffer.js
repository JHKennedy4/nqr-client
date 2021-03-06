/* */ 
'use strict';
var $def = require("./$.def"),
    buffer = require("./$.buffer"),
    toIndex = require("./$.to-index"),
    toLength = require("./$.to-length"),
    isObject = require("./$.is-object"),
    TYPED_ARRAY = require("./$.wks")('typed_array'),
    $ArrayBuffer = buffer.ArrayBuffer,
    $DataView = buffer.DataView,
    FORCED = $def.F * !buffer.useNative,
    $slice = $ArrayBuffer && $ArrayBuffer.prototype.slice,
    ARRAY_BUFFER = 'ArrayBuffer';
$def($def.G + $def.W + FORCED, {ArrayBuffer: $ArrayBuffer});
$def($def.S + FORCED, ARRAY_BUFFER, {isView: function isView(it) {
    return isObject(it) && (it instanceof $DataView || TYPED_ARRAY in it);
  }});
$def($def.P + (FORCED || require("./$.fails")(function() {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
})), ARRAY_BUFFER, {slice: function slice(start, end) {
    if ($slice !== undefined && end === undefined)
      return $slice.call(this, start);
    var len = this.byteLength,
        first = toIndex(start, len),
        final = toIndex(end === undefined ? len : end, len),
        result = new $ArrayBuffer(toLength(final - first)),
        viewS = new $DataView(this),
        viewT = new $DataView(result),
        index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    }
    return result;
  }});
