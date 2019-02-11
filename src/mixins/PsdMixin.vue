<script>
const PSD = require("../libs/psd.js");
export default {
    computed: {
        psd() {
            if (!PSD) {
                return;
            }
            return PSD;
        }
    },
    mounted() {
        this.getPsdInfo()
    },
    methods: {
        getPsdInfo() {
            console.log(this.psd);
            this.psd("./TestDesign.psd").then(function(psd) {
                console.log(psd)
            })

        }
    }
}
</script>
