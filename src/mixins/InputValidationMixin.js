export default {
  computed: {
    rule() {
      switch (this.name) {
        case "email":
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        case "password":
          return /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
        case "phone":
          return /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/gm;
        default:
          return null;
      }
    },
    valid() {
      const rule =
        this.rule || (this.validationRule && new RegExp(this.validationRule));
      if (!this.inputValue || this.inputValue === "") {
        return false;
      }
      return rule
        ? rule.test(this.inputValue)
        : this.inputValue && this.inputValue.length && this.inputValue !== "";
    }
  }
};
