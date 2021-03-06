/* */ 
'use strict';
var global = require("./$.global"),
    $ = require("./$"),
    $def = require("./$.def"),
    fails = require("./$.fails"),
    hide = require("./$.hide"),
    mix = require("./$.mix"),
    forOf = require("./$.for-of"),
    strictNew = require("./$.strict-new"),
    isObject = require("./$.is-object"),
    DESCRIPTORS = require("./$.descriptors"),
    setToStringTag = require("./$.set-to-string-tag");
module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME],
      C = Base,
      ADDER = IS_MAP ? 'set' : 'add',
      proto = C && C.prototype,
      O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function() {
    new C().entries().next();
  }))) {
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    mix(C.prototype, methods);
  } else {
    C = wrapper(function(target, iterable) {
      strictNew(target, C, NAME);
      target._c = new Base;
      if (iterable != undefined)
        forOf(iterable, IS_MAP, target[ADDER], target);
    });
    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function(KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear'))
        hide(C.prototype, KEY, function(a, b) {
          if (!IS_ADDER && IS_WEAK && !isObject(a))
            return KEY == 'get' ? undefined : false;
          var result = this._c[KEY](a === 0 ? 0 : a, b);
          return IS_ADDER ? this : result;
        });
    });
    if ('size' in proto)
      $.setDesc(C.prototype, 'size', {get: function() {
          return this._c.size;
        }});
  }
  setToStringTag(C, NAME);
  O[NAME] = C;
  $def($def.G + $def.W + $def.F, O);
  if (!IS_WEAK)
    common.setStrong(C, NAME, IS_MAP);
  return C;
};
