;(function (win, $) {
  var $win = $(win);
  var $doc = $(win.document);
  var plugin = $();

  $doc
  .ready(function () {
    initSelects();
    calculateHeight();
    initPinValidation();
  })
  .on('click', '.js-acc-btn', function () {
    var $this = $(this);
    $this.next().toggleClass('d-none d-block');
    $this.find('> i').toggleClass('d-none d-block');
  });

  $win.resize(calculateHeight);

  function validate($input, type, isInvalid) {
    var $msg = $input.next('.js-validate-msg');
    var $submitBtn = $input.closest('form').find('[id="pinOkButton"]');
    if (isInvalid) {
      var msg = $input.data('validate-' + type + '-msg');
      if (!msg) {
        msg = $input.data('validate-msg');
      }
      $input.addClass('invalid');
      $msg.html(msg).show();
      $submitBtn.prop('disabled', true);
    } else {
      $input.removeClass('invalid');
      $msg.empty().hide();
      $submitBtn.prop('disabled', false);
    }
  }

  function initPinValidation() {
    var type = 'pin';
    var attr = 'validate-' + type;
    var selector = '[data-' + attr + ']';
    var r = new RegExp('[\\d]{6}');
    $doc
    .on('blur', selector, function () {
      console.log("blur");
      var $this = $(this);
      validate($this, type, r.test($this.val()) === false);
    })
    .on('click', selector, function () {
      console.log("click");
      var $this = $(this);
      validate($this, type, r.test($this.val()) === false);
    })
    .on('input', selector, function () {
      var $this = $(this);
      if ($this.hasClass('invalid')) {
        validate($this, type, r.test($this.val()) === false);
      }
      $this.val($this.val().replace(/[^\d]/g, ''));
    });
  }

  function initSelects() {
    if (plugin.selectpicker) {
      $('select').selectpicker();
    }
  }

  function calculateHeight() {
    var $main = $('#js-main');
    var excludeHeight = 0;
    $('.js-exclude-height').each(function () {
      excludeHeight += $(this).outerHeight();
    });
    var minHeight = $win.height() - excludeHeight;
    var mainHeight = $main.height('auto').outerHeight();
    if (minHeight > mainHeight) {
      $main.height(minHeight);
    }
  }

})(this, this.jQuery);

function encryptPassword(publicKey, publicValue) {
  var publicKey = publicKey;
  var publicKeyValue = publicValue;
  var plainPassword = document.getElementById('otp').value;
  var encodedText = basicEncoder(plainPassword);
  var rsa = new RSAKey();
  rsa.setPublic(publicKey, publicKeyValue);
  var res = rsa.encrypt(encodedText);
  document.getElementById('otpPassword').value = res;
}
