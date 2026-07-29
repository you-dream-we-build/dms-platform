import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi, CreateStudentDto, toStudentPayload } from '../../api/student.api';
import { useImageUpload } from '../../hooks/useImageUpload';

type FormData = CreateStudentDto;

const STATUS_OPTIONS = ['Active', 'Pending', 'Graduated', 'Inactive'];

export function StudentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const avatarUpload = useImageUpload();
  const certificateUpload = useImageUpload();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [certificateImageUrl, setCertificateImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { status: 'Pending' } });

  // Load existing student for edit
  useEffect(() => {
    if (!id) return;
    studentApi.getOne(id).then((res) => {
      const s = res.data.data;
      reset(s);
      if (s.avatar) setAvatarUrl(s.avatar);
      if (s.certificateImage) setCertificateImageUrl(s.certificateImage);
    }).catch(() => toast.error('Failed to load student'));
  }, [id, reset]);

  const handleFileChange = async (
    picker: typeof avatarUpload,
    setUrl: (url: string) => void,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so re-picking the same file still fires onChange
    e.target.value = '';
    if (!file) return;
    const url = await picker.selectAndUpload(file);
    if (url) {
      setUrl(url);
      toast.success('Image uploaded');
    }
  };

  const onSubmit = async (data: FormData) => {
    const payload = toStudentPayload({
      ...data,
      avatar: avatarUrl,
      certificateImage: certificateImageUrl,
    });
    try {
      if (isEdit && id) {
        await studentApi.update(id, payload);
        toast.success('Student updated');
      } else {
        await studentApi.create(payload);
        toast.success('Student created');
      }
      navigate('/students');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Save failed';
      toast.error(msg);
    }
  };

  const avatarPreview = avatarUpload.preview || avatarUrl;
  const certificatePreview = certificateUpload.preview || certificateImageUrl;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Student' : 'New Student'}
        </h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5">

          {/* Profile Image Upload */}
          <div>
            <label className="field-label">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center leading-tight px-1">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="student-avatar-upload"
                  onChange={(e) => handleFileChange(avatarUpload, setAvatarUrl, e)}
                  disabled={avatarUpload.uploading}
                />
                <label htmlFor="student-avatar-upload" className="btn-secondary btn btn-sm cursor-pointer">
                  {avatarUpload.uploading ? 'Uploading…' : avatarUrl ? 'Change File' : 'Choose File'}
                </label>
                {avatarUrl && !avatarUpload.uploading && (
                  <button type="button" className="btn-ghost btn btn-sm text-red-500"
                    onClick={() => { setAvatarUrl(''); avatarUpload.reset(); }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Image Upload */}
          <div>
            <label className="field-label">Certificate Image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {certificatePreview ? (
                  <img src={certificatePreview} alt="Certificate preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center leading-tight px-1">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="certificate-image-upload"
                  onChange={(e) => handleFileChange(certificateUpload, setCertificateImageUrl, e)}
                  disabled={certificateUpload.uploading}
                />
                <label htmlFor="certificate-image-upload" className="btn-secondary btn btn-sm cursor-pointer">
                  {certificateUpload.uploading
                    ? 'Uploading…'
                    : certificateImageUrl
                      ? 'Change File'
                      : 'Choose File'}
                </label>
                {certificateImageUrl && !certificateUpload.uploading && (
                  <button type="button" className="btn-ghost btn btn-sm text-red-500"
                    onClick={() => { setCertificateImageUrl(''); certificateUpload.reset(); }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name + Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Full Name *</label>
              <input
                className="field-input"
                placeholder="Tenzin Dorjee"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="field-label">Grade *</label>
              <input
                className="field-input"
                placeholder="Grade 11"
                {...register('grade', { required: 'Grade is required' })}
              />
              {errors.grade && <p className="field-error">{errors.grade.message}</p>}
            </div>
          </div>

          {/* School + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">School / Institution *</label>
              <input
                className="field-input"
                placeholder="Namkha Khyung Dzong School"
                {...register('school', { required: 'School is required' })}
              />
              {errors.school && <p className="field-error">{errors.school.message}</p>}
            </div>
            <div>
              <label className="field-label">Region *</label>
              <input
                className="field-input"
                placeholder="Yultsho Dhun"
                {...register('region', { required: 'Region is required' })}
              />
              {errors.region && <p className="field-error">{errors.region.message}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                className="field-input"
                placeholder="student@example.com"
                {...register('email')}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                placeholder="+977 9800000000"
                {...register('phone')}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" {...register('status')}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="field-label">Notes</label>
            <textarea
              rows={3}
              className="field-input resize-none"
              placeholder="Additional notes…"
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" className="btn-secondary btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
