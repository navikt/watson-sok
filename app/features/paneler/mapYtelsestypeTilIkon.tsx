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
      return <HospitalIcon />;
    case "Uføretrygd":
      return <HouseHeartIcon />;
    case "Arbeidsavklaringspenger":
      return <BriefcaseClockIcon />;
    case "Foreldrepenger":
      return <FeedingBottleIcon />;
    case "Svangerskapspenger":
      return <BabyWrappedIcon />;
    default:
      return <NokIcon />;
  }
};
