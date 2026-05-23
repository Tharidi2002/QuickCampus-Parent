import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Container } from "@mui/material";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import CourseManagement from "./pages/CourseManagement";
import StudentManagement from "./pages/StudentManagement";
import MediaGallery from "./pages/MediaGallery";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      light: "#14b8a6",
      dark: "#134e4a",
    },
    secondary: {
      main: "#ea580c",
      light: "#fb923c",
      dark: "#9a3412",
    },
    background: {
      default: "#f4f8fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily: '"Sora", "Manrope", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            background:
              "radial-gradient(circle at top right, rgba(20,184,166,0.2), transparent 35%), radial-gradient(circle at 10% 25%, rgba(251,146,60,0.15), transparent 30%)",
          }}
        >
          <Navigation />
          <Container
            component="main"
            maxWidth="xl"
            sx={{
              flexGrow: 1,
              py: { xs: 2.5, md: 4 },
              px: { xs: 2, md: 3 },
              animation: "appReveal 500ms ease-out",
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/media" element={<MediaGallery />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
