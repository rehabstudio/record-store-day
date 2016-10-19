class Utils {
  getTransformPrefix() {
    var testElement = document.createElement('div');
    var transformNames = ['transform','webkitTransform','MozTransform','msTransform','OTransform'];
    for (var key in transformNames) {
      if( testElement.style[transformNames[key]] !== undefined ) {
        return transformNames[key];
      }
    }
  }
}

module.exports = new Utils();
