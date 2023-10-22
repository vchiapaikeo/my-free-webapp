import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const defaultTheme = createTheme();

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [savedItems, setSavedItems] = React.useState([]);

  const loadItems = async () => {
    const response = await fetch("/api/v1/items", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const items = (await response.json()).results;
    console.log(items);
    setSavedItems(items);
    setLoading(false);
    return items;
  };

  React.useEffect(() => {
    setLoading(true);
    loadItems();
  }, []);

  return loading ? (
    <CircularProgress />
  ) : (
    <ThemeProvider theme={defaultTheme}>
      <Box>
        {savedItems.map((item, idx) => {
          return <div key={idx}>{JSON.stringify(item)}</div>;
        })}
      </Box>
    </ThemeProvider>
  );
}
