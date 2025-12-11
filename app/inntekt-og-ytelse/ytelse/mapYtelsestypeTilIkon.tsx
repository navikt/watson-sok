import {
  BabyWrappedIcon,
  BriefcaseClockIcon,
  FeedingBottleIcon,
  HospitalIcon,
  HouseHeartIcon,
  NokIcon,
} from "@navikt/aksel-icons";

export const mapYtelsestypeTilIkon = (stønadtype: string): React.ReactNode => {
  switch (stønadtype) {
    case "Sykepenger":
      return <HospitalIcon aria-hidden={true} />;
    case "Uføretrygd":
      return <HouseHeartIcon aria-hidden={true} />;
    case "Arbeidsavklaringspenger":
      return <BriefcaseClockIcon aria-hidden={true} />;
    case "Foreldrepenger":
      return <FeedingBottleIcon aria-hidden={true} />;
    case "Svangerskapspenger":
      return <BabyWrappedIcon aria-hidden={true} />;
    default:
      return <NokIcon aria-hidden={true} />;
  }
};
