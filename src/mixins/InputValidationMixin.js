export default {
  props: {
    validationShowManual: Boolean,
    showValidation: Boolean, /** Using only if validationShowManual true **/
  },
  computed: {
    shouldShowValidation() {
      return this.validationShowManual ? !this.valid && this.showValidation : !this.valid && this.focused
    },
    valid() {
      if (!this.required) {
        return true;
      }
      let defaultRule = null;
      switch (this.name) {
        case "email":
          defaultRule = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          break;
        case "password":
          defaultRule = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
          break;
        case "phone":
          defaultRule = /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/gm;
          break;
        case "url":
          defaultRule = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/g;
          break;
      }
      const rule = this.validationRule || defaultRule;

      if (!this.inputValue) {
        return false;
      }
      if (rule) {
        return rule.test(this.inputValue);
      } else {
        return (
          this.inputValue && this.inputValue.length && this.inputValue !== ""
        );
      }
    }
  }
};
