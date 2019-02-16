import InputMask from "inputmask";
InputMask.extendDefaults({
  showMaskOnHover: false,
  showMaskOnFocus: true
});
export default {
  mounted() {
    this.$nextTick(() => {
      this.applyMask();
    });
  },
  methods: {
    applyMask() {
      const elem = document.getElementById(`input-${this.name}`);
      if (!elem || !this.mask) {
        return;
      }
      switch (this.mask) {
        case "phone":
          InputMask({ mask: "+7 (999) 999-99-99" }).mask(elem);
          break;
        case "number":
          this.maskPattern
            ? InputMask({ mask: this.maskPattern }).mask(elem)
            : InputMask({ regex: "^[0-9]{1,6}(\\.\\d{1,2})?$" }).mask(elem);
          break;
      }
    }
  }
};
