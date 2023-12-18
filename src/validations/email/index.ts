import YupObject from "../object";
import YupString from "../string";
import YupStringRequired from "../string/required";

export const _YupEmail = YupString.lowercase().matches(
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    {
        message: "l'indirizzo di posta elettronica è invalido o incompleto",
        excludeEmptyString: true
    }
);

export const _YupPec = YupString.matches(
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    {
        message:
            "l'indirizzo di posta elettronica certificata è invalido o incompleto",
        excludeEmptyString: false
    }
);

export const YupPecRequired = YupObject.shape({
    email: _YupPec.concat(YupStringRequired("Posta Elettronica Certificata"))
});
export const YupPec = YupObject.shape({
    email: _YupPec
});

const YupEmail = YupObject.shape({
    email: _YupEmail
});

export const YupEmailRequired = YupObject.shape({
    email: _YupEmail.concat(YupStringRequired("Posta Elettronica"))
});

export default YupEmail;
