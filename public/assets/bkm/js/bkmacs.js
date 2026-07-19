if (!Element.prototype.remove)
    Element.prototype.remove = remove;
if (Text && !Text.prototype.remove)
    Text.prototype.remove = remove;

function remove() {
    this.parentNode && this.parentNode.removeChild(this);
}

function addClass(classname, element) {
    var cn = element.className;
    //test for existance
    if (cn.indexOf(classname) != -1) {
        return;
    }
    //add a space if the element already has class
    if (cn != '') {
        classname = ' ' + classname;
    }
    element.className = cn + classname;
}

function removeClass(classname, element) {
    var cn = element.className;
    var rxp = new RegExp('(?:^|\\s)' + classname + '(?!\\S)');
    cn = cn.replace(rxp, '');
    element.className = cn;
}

function isClassExist(classname, element) {
    var cn = element.className;
    return (cn.indexOf(classname) != -1);
}

function maxLengthCheck(object) {
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

function isNumeric(evt) {
    /*
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode (key);
    var regex = /[0-9]|\./;
    if ( !regex.test(key) ) {
    	theEvent.returnValue = false;
    	if(theEvent.preventDefault) theEvent.preventDefault();
    }
    */
}