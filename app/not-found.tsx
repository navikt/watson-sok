import { BodyShort, Box, Heading, Link, List } from "@navikt/ds-react";
import { ListItem } from "@navikt/ds-react/List";
import { PageBlock } from "@navikt/ds-react/Page";

const NotFound = () => {
  return (
    <PageBlock width="xl" gutters>
      <Box paddingBlock="20 16" data-aksel-template="404-golden-path">
        <div>
          <Heading level="1" size="large" spacing>
            Beklager, vi fant ikke siden
          </Heading>
          <BodyShort>
            Denne siden kan være slettet eller flyttet, eller det er en feil i
            lenken.
          </BodyShort>
          <List>
            <ListItem>Bruk gjerne søket eller menyen</ListItem>
            <ListItem>
              <Link href="#">Gå til forsiden</Link>
            </ListItem>
          </List>
        </div>
      </Box>
    </PageBlock>
  );
};

export default NotFound;
