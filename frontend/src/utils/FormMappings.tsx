import EmailForm from "../components/QuestionForms/EmailForm";
import Checkbox from "../components/QuestionForms/Checkbox";
import CheckboxListWithOther from "../components/QuestionForms/Checkbox";
import RadioButton from "../components/QuestionForms/RadioButton";
import SingleLineTextForm from "../components/QuestionForms/SingleLineTextForm";
import MultiLineTextForm from "../components/QuestionForms/MultiLineTextForm";
import DropDownForm from "@/components/QuestionForms/DropDownForm";
import PhoneNumberForm from "@/components/QuestionForms/PhoneNumberForm";
import RatingForm from "@/components/QuestionForms/RatingForm";
import DateForm from "@/components/QuestionForms/DateForm";
import RadioButtonWithText from "@/components/QuestionForms/Advance/RadioButtonWithTextForm";
import DropDownGridForm from "@/components/QuestionForms/Advance/DropDownGridForm";
import DropDownWithOtherGridForm from "@/components/QuestionForms/Advance/DropDownWithOtherGridForm";
import SinglelineTextGridForm from "@/components/QuestionForms/Advance/SinglelineTextGridForm";
import NumberGridForm from "@/components/QuestionForms/Advance/NumberGrid";
import ContactForm from "@/components/QuestionForms/Advance/ContactForm";
import AddressForm from "@/components/QuestionForms/Advance/AddressForm";
import DecimalGridForm from "@/components/QuestionForms/Advance/DecimalGridForm";
import RadioGridForm from "@/components/QuestionForms/Advance/RadioGridForm";
import RadioGridOtherForm from "@/components/QuestionForms/Advance/RadioGridOtherForm";
import CheckBoxWithTextForm from "@/components/QuestionForms/Advance/CheckBoxWithText";
import CheckBoxGridForm from "@/components/QuestionForms/Advance/CheckBoxGridForm";
import CheckBoxGridOtherForm from "@/components/QuestionForms/Advance/CheckBoxGridOtherForm";
import NumberPointGridForm from "@/components/QuestionForms/Advance/NumberPointGridForm";
import NumberInputForm from "@/components/QuestionForms/NumberInputForm";
import AudioForm from "@/components/QuestionForms/Advance/AudioForm";
import Image from "@/components/QuestionForms/Image";

function FormMappings(): { [key: string]: React.ComponentType<any> } {
  return {
    Email: EmailForm,
    "Single line Text Input": SingleLineTextForm,
    "Multiline Text Input": MultiLineTextForm,
    "Checkbox List With Other": CheckboxListWithOther,
    "Checkbox List": Checkbox,
    "Radio Button": RadioButton,
    DropDown: DropDownForm,
    "DropDown With Other": DropDownForm,
    "Number Input": NumberInputForm,
    "Phone Number": PhoneNumberForm,
    Rating: RatingForm,
    Date: DateForm,
    "Radio Button With Other": RadioButtonWithText,
    "DropDown Grid": DropDownGridForm,
    "DropDown With Other Grid": DropDownWithOtherGridForm,
    "Single line Text Grid": SinglelineTextGridForm,
    "Number Grid": NumberGridForm,
    "Contact Form": ContactForm,
    Address: AddressForm,
    "Decimal Grid": DecimalGridForm,
    "Radio Grid": RadioGridForm,
    "Radio Grid With Other": RadioGridOtherForm,
    "Checkbox With Text": CheckBoxWithTextForm,
    "Checkbox Grid": CheckBoxGridForm,
    "Checkbox Grid With Other": CheckBoxGridOtherForm,
    "Number Point Grid": NumberPointGridForm,
    "Audio" : AudioForm,
    "Image": Image
  };
}

export default FormMappings;
