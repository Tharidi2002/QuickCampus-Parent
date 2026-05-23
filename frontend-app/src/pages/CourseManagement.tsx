import React, { type FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  AutoStories as AutoStoriesIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import type { Course } from "../services/api";
import { courseService } from "../services/api";

interface CourseFormData {
  id: string;
  name: string;
  duration: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    id: "",
    name: "",
    duration: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<CourseFormData>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError("Failed to load courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ id: "", name: "", duration: "" });
    setFormErrors({});
    setOpenDialog(true);
    // Focus the first input field after dialog opens
    setTimeout(() => {
      const element = document.querySelector(
        'input[name="id"]',
      ) as HTMLInputElement;
      if (element) {
        element.focus();
      }
    }, 100);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ id: "", name: "", duration: "" });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<CourseFormData> = {};

    if (!formData.id.trim()) {
      errors.id = "Course ID is required";
    } else if (!/^[A-Za-z]+$/.test(formData.id)) {
      errors.id = "Course ID must contain only letters";
    }

    if (!formData.name.trim()) {
      errors.name = "Course name is required";
    } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
      errors.name = "Course name must contain only letters and spaces";
    }

    if (!formData.duration.trim()) {
      errors.duration = "Course duration is required";
    }

    setFormErrors(errors);

    // Focus and select the first error field
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      setTimeout(() => {
        const element = document.querySelector(
          `input[name="${firstErrorField}"]`,
        ) as HTMLInputElement;
        if (element) {
          element.focus();
          element.select();
        }
      }, 100);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await courseService.create(formData);
      fetchCourses();
    } catch (err) {
      setError("Failed to save course");
      console.error("Error saving course:", err);
    } finally {
      handleCloseDialog();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.delete(id);
        fetchCourses();
      } catch (err) {
        setError("Failed to delete course");
        console.error("Error deleting course:", err);
      }
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3.5,
          flexWrap: "wrap",
          gap: 2,
          pb: 2.5,
          borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Course Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Build and organize your course catalog in one place.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${courses.length} ${courses.length === 1 ? "Course" : "Courses"}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ minWidth: "fit-content", px: 2.2, py: 1 }}
          >
            Add Course
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {courses.length === 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                background: "linear-gradient(160deg, #ffffff, #f8fafc)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                No courses available
              </Typography>
              <Typography color="text.secondary">
                Add your first course to get started.
              </Typography>
            </Card>
          </Grid>
        )}
        {courses.map((course, index) => (
          <Grid item xs={12} sm={6} lg={4} key={course.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(160deg, #ffffff, #f8fafc)",
                animation: "cardRise 400ms ease-out",
                animationDelay: `${index * 60}ms`,
                animationFillMode: "both",
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 35px rgba(15, 23, 42, 0.12)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 42, height: 42 }}
                    >
                      <AutoStoriesIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {course.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Course ID: {course.id}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(course.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Duration: <strong>{course.duration}</strong>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Course Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>Add New Course</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                name="id"
                label="Course ID"
                value={formData.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                error={!!formErrors.id}
                helperText={formErrors.id}
                margin="normal"
                placeholder="e.g., HDSE"
                autoFocus={true}
              />
              <TextField
                fullWidth
                name="name"
                label="Course Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
                placeholder="e.g., Higher Diploma in Software Engineering"
              />
              <TextField
                fullWidth
                name="duration"
                label="Duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                margin="normal"
                placeholder="e.g., 2 Years"
              />
              <DialogActions sx={{ px: 0 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Add Course
                </Button>
              </DialogActions>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;
