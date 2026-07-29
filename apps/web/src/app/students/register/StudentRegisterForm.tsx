'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormFields {
  name: string;
  grade: string;
  school: string;
  region: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL: FormFields = {
  name: '',
  grade: '',
  school: '',
  region: '',
  email: '',
  phone: '',
  notes: '',
};

/** Image fields uploaded to POST /api/upload before the student is created. */
type ImageField = 'avatar' | 'certificateImage';

const IMAGE_FIELDS: ImageField[] = ['avatar', 'certificateImage'];

const EMPTY_IMAGES: Record<ImageField, string> = {
  avatar: '',
  certificateImage: '',
};

// Keep these in sync with apps/api/src/modules/upload/upload.constants.ts
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = /^image\/(jpe?g|png|gif|webp)$/;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

/* ── Inline styles — scoped to this component ─────────────────── */
const s: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '1.5rem 1.75rem',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1a3a5c',          // strong navy — always visible
    display: 'block',
  },
  optional: {
    fontWeight: 400,
    color: '#888',
    fontSize: '0.8rem',
  },
  required: {
    color: '#dc2626',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.875rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1a1a1a',
    background: '#f8fafc',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  inputError: {
    borderColor: '#dc2626',
    background: '#fff5f5',
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '100px',
  },
  // Image upload
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    background: '#f1f5f9',
    border: '1.5px dashed #cbd5e1',
    color: '#94a3b8',
    fontSize: '0.7rem',
    textAlign: 'center' as const,
  },
  previewCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
  },
  previewRect: {
    width: '110px',
    height: '72px',
    borderRadius: '8px',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  uploadControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.4rem',
  },
  fileButton: {
    display: 'inline-block',
    padding: '0.45rem 0.9rem',
    border: '1.5px solid #0f3d68',
    borderRadius: '8px',
    color: '#0f3d68',
    background: '#fff',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  fileButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  hiddenFileInput: {
    display: 'none',
  },
  removeButton: {
    padding: 0,
    border: 'none',
    background: 'none',
    color: '#dc2626',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#888',
  },
  errorMsg: {
    fontSize: '0.78rem',
    color: '#dc2626',
    marginTop: '0.1rem',
  },
  serverError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderLeft: '4px solid #dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '0.9rem',
  },
  infoNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    fontSize: '0.85rem',
    color: '#4a5568',
    background: '#eff6ff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    borderLeft: '3px solid #0f3d68',
    lineHeight: '1.6',
  },
  infoIcon: {
    flexShrink: 0,
    color: '#0f3d68',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e8eef5',
    flexWrap: 'wrap' as const,
  },
  // Success
  successWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    gap: '1.25rem',
  },
  successIconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f3d68, #1a5c9a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(15,61,104,0.3)',
  },
  successIcon: {
    fontSize: '2rem',
    color: 'white',
    fontWeight: 700,
  },
  successHeading: {
    fontSize: '1.5rem',
    color: '#0f3d68',
    margin: 0,
  },
  successBody: {
    color: '#555',
    maxWidth: '420px',
    lineHeight: 1.7,
    margin: 0,
  },
  successActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
};

function mergeStyle(...styles: React.CSSProperties[]): React.CSSProperties {
  return Object.assign({}, ...styles);
}

export default function StudentRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormFields>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  // Uploaded image URLs, local object-URL previews, and per-field upload state
  const [images, setImages] = useState<Record<ImageField, string>>(EMPTY_IMAGES);
  const [previews, setPreviews] = useState<Record<ImageField, string>>(EMPTY_IMAGES);
  const [uploading, setUploading] = useState<Record<ImageField, boolean>>({
    avatar: false,
    certificateImage: false,
  });
  const [imageErrors, setImageErrors] = useState<Record<ImageField, string>>(EMPTY_IMAGES);

  const isUploading = IMAGE_FIELDS.some((f) => uploading[f]);

  /** Swap in a new preview for `field`, releasing the object URL it replaces. */
  const setPreview = (field: ImageField, url: string) => {
    setPreviews((prev) => {
      if (prev[field]) URL.revokeObjectURL(prev[field]);
      return { ...prev, [field]: url };
    });
  };

  const clearImages = () => {
    IMAGE_FIELDS.forEach((f) => setPreview(f, ''));
    setImages(EMPTY_IMAGES);
    setImageErrors(EMPTY_IMAGES);
  };

  const handleImageSelect = async (
    field: ImageField,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so re-picking the same file still fires onChange
    e.target.value = '';
    if (!file) return;

    setServerError('');
    setImageErrors((prev) => ({ ...prev, [field]: '' }));

    if (!ALLOWED_IMAGE_MIME.test(file.type)) {
      setImageErrors((prev) => ({
        ...prev,
        [field]: 'Choose a JPG, PNG, GIF or WEBP image',
      }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageErrors((prev) => ({
        ...prev,
        [field]: 'Image must be 5 MB or smaller',
      }));
      return;
    }

    setPreview(field, URL.createObjectURL(file));
    setImages((prev) => ({ ...prev, [field]: '' }));
    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body });
      const data = await res.json();

      if (!res.ok || !data?.data?.url) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message;
        throw new Error(msg ?? 'Upload failed');
      }

      setImages((prev) => ({ ...prev, [field]: data.data.url }));
    } catch (err) {
      setPreview(field, '');
      setImageErrors((prev) => ({
        ...prev,
        [field]:
          err instanceof Error && err.message
            ? err.message
            : 'Upload failed. Please try again.',
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleImageRemove = (field: ImageField) => {
    setPreview(field, '');
    setImages((prev) => ({ ...prev, [field]: '' }));
    setImageErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormFields> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.grade.trim()) errs.grade = 'Grade or class level is required';
    if (!form.school.trim()) errs.school = 'School or institution is required';
    if (!form.region.trim()) errs.region = 'Region or location is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#0f3d68';
    e.target.style.boxShadow = '0 0 0 3px rgba(15,61,104,0.12)';
    e.target.style.background = '#fff';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#cbd5e1';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#f8fafc';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isUploading) {
      setServerError('Please wait for the image upload to finish.');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          grade: form.grade.trim(),
          school: form.school.trim(),
          region: form.region.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          notes: form.notes.trim() || undefined,
          avatar: images.avatar || undefined,
          certificateImage: images.certificateImage || undefined,
          status: 'Pending',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        setServerError(msg ?? 'Registration failed. Please try again.');
        return;
      }

      setSubmittedName(form.name.trim());
      setSuccess(true);
      setForm(INITIAL);
      clearImages();
    } catch {
      setServerError('Unable to connect to the server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={s.successWrap}>
        <div style={s.successIconWrap}>
          <span style={s.successIcon}>✓</span>
        </div>
        <h2 style={s.successHeading}>Registration Submitted!</h2>
        <p style={s.successBody}>
          Thank you, <strong>{submittedName}</strong>. Your application has been received
          and is currently <strong>pending review</strong> by the Degyal Memorial Society
          committee. We will get in touch with you shortly.
        </p>
        <div style={s.successActions}>
          <button
            className="btn btn-sm"
            onClick={() => { setSuccess(false); setSubmittedName(''); }}
          >
            Register Another
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => router.push('/students')}>
            View All Students
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = (field: keyof FormFields) =>
    mergeStyle(s.input, errors[field] ? s.inputError : {});

  return (
    <form style={s.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div style={s.serverError} role="alert">{serverError}</div>
      )}

      {/* Name + Grade */}
      <div style={s.row2}>
        <div style={s.group}>
          <label style={s.label} htmlFor="reg-name">
            Full Name <span style={s.required}>*</span>
          </label>
          <input
            id="reg-name" name="name" type="text"
            style={inputStyle('name')}
            placeholder="e.g. Tenzin Dorjee"
            value={form.name} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
            autoComplete="name"
          />
          {errors.name && <span style={s.errorMsg}>{errors.name}</span>}
        </div>

        <div style={s.group}>
          <label style={s.label} htmlFor="reg-grade">
            Grade / Class <span style={s.required}>*</span>
          </label>
          <input
            id="reg-grade" name="grade" type="text"
            style={inputStyle('grade')}
            placeholder="e.g. Grade 11, Bachelor 1st Year"
            value={form.grade} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
          />
          {errors.grade && <span style={s.errorMsg}>{errors.grade}</span>}
        </div>
      </div>

      {/* School + Region */}
      <div style={s.row2}>
        <div style={s.group}>
          <label style={s.label} htmlFor="reg-school">
            School / Institution <span style={s.required}>*</span>
          </label>
          <input
            id="reg-school" name="school" type="text"
            style={inputStyle('school')}
            placeholder="e.g. Namkha Khyung Dzong School"
            value={form.school} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
          />
          {errors.school && <span style={s.errorMsg}>{errors.school}</span>}
        </div>

        <div style={s.group}>
          <label style={s.label} htmlFor="reg-region">
            Region <span style={s.required}>*</span>
          </label>
          <input
            id="reg-region" name="region" type="text"
            style={inputStyle('region')}
            placeholder="e.g. Yultsho Dhun, Limi, Nyin"
            value={form.region} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
          />
          {errors.region && <span style={s.errorMsg}>{errors.region}</span>}
        </div>
      </div>

      {/* Email + Phone */}
      <div style={s.row2}>
        <div style={s.group}>
          <label style={s.label} htmlFor="reg-email">
            Email <span style={s.optional}>(optional)</span>
          </label>
          <input
            id="reg-email" name="email" type="email"
            style={inputStyle('email')}
            placeholder="student@example.com"
            value={form.email} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
            autoComplete="email"
          />
          {errors.email && <span style={s.errorMsg}>{errors.email}</span>}
        </div>

        <div style={s.group}>
          <label style={s.label} htmlFor="reg-phone">
            Phone <span style={s.optional}>(optional)</span>
          </label>
          <input
            id="reg-phone" name="phone" type="tel"
            style={s.input}
            placeholder="+977 9800000000"
            value={form.phone} onChange={handleChange}
            onFocus={handleFocus} onBlur={handleBlur}
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Notes */}
      <div style={s.group}>
        <label style={s.label} htmlFor="reg-notes">
          Additional Notes <span style={s.optional}>(optional)</span>
        </label>
        <textarea
          id="reg-notes" name="notes" rows={4}
          style={mergeStyle(s.input, s.textarea)}
          placeholder="Share any additional information about your academic situation, financial need, or any other relevant details…"
          value={form.notes} onChange={handleChange}
          onFocus={handleFocus} onBlur={handleBlur}
        />
      </div>

      {/* Profile + Certificate images */}
      <div style={s.row2}>
        <div style={s.group}>
          <label style={s.label} htmlFor="reg-profile-image">
            Profile Image <span style={s.optional}>(optional)</span>
          </label>
          <div style={s.uploadRow}>
            <div style={mergeStyle(s.previewBox, s.previewCircle)}>
              {previews.avatar ? (
                <img src={previews.avatar} alt="Profile preview" style={s.previewImg} />
              ) : (
                <span>No image</span>
              )}
            </div>
            <div style={s.uploadControls}>
              <input
                id="reg-profile-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={s.hiddenFileInput}
                onChange={(e) => handleImageSelect('avatar', e)}
                disabled={uploading.avatar || submitting}
              />
              <label
                htmlFor="reg-profile-image"
                style={mergeStyle(
                  s.fileButton,
                  uploading.avatar || submitting ? s.fileButtonDisabled : {},
                )}
              >
                {uploading.avatar
                  ? 'Uploading…'
                  : images.avatar
                    ? 'Change Photo'
                    : 'Choose Photo'}
              </label>
              {images.avatar && !uploading.avatar && (
                <button
                  type="button"
                  style={s.removeButton}
                  onClick={() => handleImageRemove('avatar')}
                >
                  Remove
                </button>
              )}
              <span style={s.hint}>JPG, PNG, GIF or WEBP · max 5 MB</span>
            </div>
          </div>
          {imageErrors.avatar && (
            <span style={s.errorMsg}>{imageErrors.avatar}</span>
          )}
        </div>

        <div style={s.group}>
          <label style={s.label} htmlFor="reg-certificate-image">
            Certificate Image <span style={s.optional}>(optional)</span>
          </label>
          <div style={s.uploadRow}>
            <div style={mergeStyle(s.previewBox, s.previewRect)}>
              {previews.certificateImage ? (
                <img
                  src={previews.certificateImage}
                  alt="Certificate preview"
                  style={s.previewImg}
                />
              ) : (
                <span>No image</span>
              )}
            </div>
            <div style={s.uploadControls}>
              <input
                id="reg-certificate-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={s.hiddenFileInput}
                onChange={(e) => handleImageSelect('certificateImage', e)}
                disabled={uploading.certificateImage || submitting}
              />
              <label
                htmlFor="reg-certificate-image"
                style={mergeStyle(
                  s.fileButton,
                  uploading.certificateImage || submitting ? s.fileButtonDisabled : {},
                )}
              >
                {uploading.certificateImage
                  ? 'Uploading…'
                  : images.certificateImage
                    ? 'Change Certificate'
                    : 'Choose Certificate'}
              </label>
              {images.certificateImage && !uploading.certificateImage && (
                <button
                  type="button"
                  style={s.removeButton}
                  onClick={() => handleImageRemove('certificateImage')}
                >
                  Remove
                </button>
              )}
              <span style={s.hint}>Latest marksheet or certificate · max 5 MB</span>
            </div>
          </div>
          {imageErrors.certificateImage && (
            <span style={s.errorMsg}>{imageErrors.certificateImage}</span>
          )}
        </div>
      </div>

      {/* Info note */}
      <div style={s.infoNote}>
        <span style={s.infoIcon}>ℹ</span>
        <span>
          Your application will be reviewed by our committee. Your registration status
          will be <strong>Pending</strong> until approved.
        </span>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => router.push('/students')}
          disabled={submitting}
        >
          ← Back to Students
        </button>
        <button
          type="submit"
          className="btn btn-sm"
          disabled={submitting || isUploading}
        >
          {submitting
            ? 'Submitting…'
            : isUploading
              ? 'Uploading image…'
              : 'Submit Registration'}
        </button>
      </div>
    </form>
  );
}
