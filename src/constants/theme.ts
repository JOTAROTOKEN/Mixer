import { createTheme } from '@mui/material/styles';
import { pink, grey } from '@mui/material/colors';

export const customTheme = createTheme({
    palette: {
        primary: {
            main: pink[500],
        },
        secondary: {
            main: grey[900],
        },
    },
    components: {
        // Name of the component
        MuiTextField: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    border: "0px solid gray",
                    borderRadius: "0.5rem",
                    input: {
                        color: "white",
                    },
                    fieldset: {
                        borderRadius: "0.5rem",
                        borderColor: "gray !important"
                    },
                },
            },
        },
    },
});