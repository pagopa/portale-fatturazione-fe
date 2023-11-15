import YupString from ".."

const YupStringDiversoDaZero = (label: string) =>
    YupString.test({
        name: "diverso-da-zero",
        test: function (value) {
            if (value && parseInt(value) == 0) {
                return true // desativando la verifica per richiesta
                return false
            } else {
                return true
            }
        },
        message: `Il campo [${label}] deve essere diverso da zero`
    })

export default YupStringDiversoDaZero
