import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const branches = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics & Communication',
  'Information Technology',
];

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ADMIN_CREDENTIALS = {
  id: 'sjce',
  password: 'jssstu',
};

const RegistrationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    srNo: '',
    name: '',
    email: '',
    mobile: '',
    department: '',
    password: '',
    confirmPassword: '',
    guestMobile: '',
    otp: '',
    adminId: '',
    adminPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [tab, setTab] = useState('college');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'mobile' || name === 'guestMobile') {
      if (value === '' || /^\d{0,10}$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'password' || name === 'confirmPassword' || name === 'adminPassword') {
      if (!/\s/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateCollege = () => {
    let tempErrors = {};

    if (!form.srNo.trim()) tempErrors.srNo = 'SR No is required';

    if (!form.name.trim()) tempErrors.name = 'Name is required';
    else if (!/^[A-Za-z\s]+$/.test(form.name.trim()))
      tempErrors.name = 'Name can only contain letters and spaces';

    if (!form.mobile.trim()) tempErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim()))
      tempErrors.mobile = 'Mobile number must be exactly 10 digits';

    if (!form.email.trim()) tempErrors.email = 'Email is required';

    if (!form.department.trim()) tempErrors.department = 'Branch is required';

    if (!form.password) tempErrors.password = 'Password is required';
    else if (!passwordRegex.test(form.password))
      tempErrors.password =
        'Password must be 8+ chars, include uppercase, number & special char, no spaces';

    if (!form.confirmPassword) tempErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      tempErrors.confirmPassword = 'Passwords do not match';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateGuestMobile = () => {
    let tempErrors = {};

    if (!form.guestMobile.trim()) tempErrors.guestMobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.guestMobile.trim()))
      tempErrors.guestMobile = 'Mobile number must be exactly 10 digits';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCollegeSubmit = async (e) => {
    e.preventDefault();
    if (!validateCollege()) return;

    const submissionData = {
      srNo: form.srNo.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: '+91' + form.mobile.trim(),
      department: form.department,
      password: form.password,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/register/college`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registered successfully');
        onClose();
        resetForm();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error registering');
    }
  };

  const sendOtp = async () => {
    if (!validateGuestMobile()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/register/guest/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '+91' + form.guestMobile.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        alert('OTP sent!');
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    if (!form.otp.trim()) {
      alert('Please enter OTP');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/register/guest/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '+91' + form.guestMobile.trim(), otp: form.otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Guest verified successfully');
        onClose();
        resetForm();
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error(error);
      alert('Error verifying OTP');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    let tempErrors = {};
    if (!form.adminId.trim()) tempErrors.adminId = 'Admin ID is required';
    if (!form.adminPassword) tempErrors.adminPassword = 'Password is required';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    if (
      form.adminId === ADMIN_CREDENTIALS.id &&
      form.adminPassword === ADMIN_CREDENTIALS.password
    ) {
      alert('Admin login successful');
      onClose();
      resetForm();
      navigate('/admin/dashboard');  // Redirect after successful admin login
    } else {
      alert('Invalid admin credentials');
    }
  };

  const resetForm = () => {
    setForm({
      srNo: '',
      name: '',
      email: '',
      mobile: '',
      department: '',
      password: '',
      confirmPassword: '',
      guestMobile: '',
      otp: '',
      adminId: '',
      adminPassword: '',
    });
    setErrors({});
    setOtpSent(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); resetForm(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Registration / Admin Login</DialogTitle>
          <DialogDescription>
            Please register by filling the form below, verifying your mobile if you are a guest, or login as admin.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setErrors({});
            setOtpSent(false);
            resetForm();
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="college">College People</TabsTrigger>
            <TabsTrigger value="guest">Guest</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>

          {/* College Registration */}
          <TabsContent value="college">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <form onSubmit={handleCollegeSubmit} className="space-y-4">
                <div>
                  <Label>SR No</Label>
                  <Input required name="srNo" value={form.srNo} onChange={handleChange} autoComplete="off" />
                  {errors.srNo && <p className="text-red-600 text-sm mt-1">{errors.srNo}</p>}
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Alphabets and spaces only"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label>Mobile</Label>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-200 rounded select-none">+91</span>
                    <Input
                      required
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="10 digit mobile number"
                      autoComplete="off"
                    />
                  </div>
                  {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    required
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label>Branch</Label>
                  <select
                    required
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="" disabled>
                      Select Branch
                    </option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    required
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="8+ chars, uppercase, number, special char"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    required
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full mt-4">
                  Register
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Guest Registration */}
          <TabsContent value="guest">
            <div className="space-y-4">
              <div>
                <Label>Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-gray-200 rounded select-none">+91</span>
                  <Input
                    name="guestMobile"
                    value={form.guestMobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="10 digit mobile number"
                    autoComplete="off"
                    disabled={otpSent}
                  />
                </div>
                {errors.guestMobile && <p className="text-red-600 text-sm mt-1">{errors.guestMobile}</p>}
              </div>

              {!otpSent ? (
                <Button onClick={sendOtp} disabled={!form.guestMobile || form.guestMobile.length !== 10}>
                  Send OTP
                </Button>
              ) : (
                <>
                  <div>
                    <Label>Enter OTP</Label>
                    <Input
                      name="otp"
                      value={form.otp}
                      onChange={handleChange}
                      maxLength={6}
                      placeholder="6 digit OTP"
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={verifyOtp} disabled={!form.otp || form.otp.length !== 6}>
                    Verify OTP
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin">
            <div className="max-h-[40vh] overflow-y-auto pr-2">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <Label>Admin ID</Label>
                  <Input
                    required
                    name="adminId"
                    value={form.adminId}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  {errors.adminId && <p className="text-red-600 text-sm mt-1">{errors.adminId}</p>}
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    required
                    name="adminPassword"
                    type="password"
                    value={form.adminPassword}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  {errors.adminPassword && <p className="text-red-600 text-sm mt-1">{errors.adminPassword}</p>}
                </div>

                <Button type="submit" className="w-full mt-4">
                  Login as Admin
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
