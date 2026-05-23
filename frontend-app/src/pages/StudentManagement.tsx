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
  Delete as DeleteIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import type { Student } from "../services/api";
import { studentService } from "../services/api";

interface StudentFormData {
  registrationNumber: string;
  fullName: string;
  address: string;
  contact: string;
  email: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    registrationNumber: "",
    fullName: "",
    address: "",
    contact: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError("Failed to load students");
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      registrationNumber: "",
      fullName: "",
      email: "",
      contact: "",
      address: "",
    });
    setFormErrors({});
    setOpenDialog(true);
    // Focus the first input field after dialog opens
    setTimeout(() => {
      const element = document.querySelector(
        'input[name="registrationNumber"]',
      ) as HTMLInputElement;
      if (element) {
        element.focus();
      }
    }, 100);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      registrationNumber: "",
      fullName: "",
      address: "",
      contact: "",
      email: "",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};

    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = "Registration number is required";
    } else if (!/^S\d{3}$/.test(formData.registrationNumber)) {
      errors.registrationNumber =
        "Registration number must follow the format SXXX";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      errors.fullName = "Full name should only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.contact.trim()) {
      errors.contact = "Contact number is required";
    } else if (!/^\d{3}-\d{7}$/.test(formData.contact)) {
      errors.contact = "Contact must follow the format XXX-XXXXXXX";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    } else if (formData.address.length < 3) {
      errors.address = "Address must contain at least 3 characters";
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
      await studentService.create(formData);
      handleCloseDialog();
      fetchStudents();
    } catch (err) {
      setError("Failed to save student");
      console.error("Error saving student:", err);
    } finally {
      handleCloseDialog();
    }
  };

  const handleDelete = async (registrationNumber: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.delete(registrationNumber);
        fetchStudents();
      } catch (err) {
        setError("Failed to delete student");
        console.error("Error deleting student:", err);
      }
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
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
          pb: 2.5,
          flexWrap: "wrap",
          gap: 2,
          borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Student Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Keep student records clear, accurate, and easy to scan.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            label={`${students.length} ${students.length === 1 ? "Student" : "Students"}`}
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
            Add Student
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {students.length === 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                background: "linear-gradient(160deg, #ffffff, #f8fafc)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                No students available
              </Typography>
              <Typography color="text.secondary">
                Add your first student record to get started.
              </Typography>
            </Card>
          </Grid>
        )}
        {students.map((student, index) => (
          <Grid item xs={12} sm={6} lg={4} key={student.registrationNumber}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(160deg, #ffffff, #f8fafc)",
                animation: "cardRise 420ms ease-out",
                animationDelay: `${index * 55}ms`,
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
                  gap: 1.5,
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
                      sx={{ bgcolor: "secondary.main", width: 42, height: 42 }}
                    >
                      <PersonIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {student.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reg No: {student.registrationNumber}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(student.registrationNumber)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {student.email}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {student.contact}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnIcon
                    sx={{ fontSize: 17, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {student.address}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Student Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>Add New Student</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="registrationNumber"
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) =>
                  handleInputChange("registrationNumber", e.target.value)
                }
                error={!!formErrors.registrationNumber}
                helperText={formErrors.registrationNumber}
                margin="normal"
                autoFocus={true}
                placeholder="e.g., S001"
              />
              <TextField
                fullWidth
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                margin="normal"
                placeholder="e.g., John Doe"
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                margin="normal"
                placeholder="e.g., john.doe@example.com"
              />
              <TextField
                fullWidth
                name="contact"
                label="Contact Number"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                error={!!formErrors.contact}
                helperText={formErrors.contact}
                margin="normal"
                placeholder="e.g., 077-1234567"
              />
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                error={!!formErrors.address}
                helperText={formErrors.address}
                margin="normal"
                placeholder="e.g., 123 Main Street, Colombo"
              />
              <DialogActions sx={{ px: 0 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Add Student
                </Button>
              </DialogActions>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;
