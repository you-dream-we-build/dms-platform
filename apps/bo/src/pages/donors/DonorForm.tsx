import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donorApi, CreateDonorDto, toDonorPayload } from '../../api/donor.api';
import { useImageUpload } from '../../hooks/useImageUpload';

type FormData = CreateDonorDto;

const TYPE_OPTIONS = ['One-time', 'Monthly', 'Annual'];

export function DonorForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const profileUpload = useImageUpload();
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { type: 'One-time', currency: 'NPR', date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    if (!id) return;
    donorApi.getOne(id).then((res) => {
      const d = res.data.data;
      reset({ ...d, date: d.date ? new Date(d.date).toISOString().split('T')[0] : '' });
      // Fall back to the legacy `avatar` field for records created before
      // `profileImage` existed.
      if (d.profileImage || d.avatar) setProfileImageUrl(d.profileImage || d.avatar);
    }).catch(() => toast.error('Failed to load donor'));
  }, [id, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    profileUpload.selectFile(file);
  };

  const handleUpload = async () => {
    const file = profileFileRef.current?.files?.[0];
    if (!file) return;
    const url = await profileUpload.upload(file);
    if (url) {
      setProfileImageUrl(url);
      toast.success('Image uploaded');
    }
  };

  const onSubmit = async (data: FormData) => {
    const payload = toDonorPayload({
      ...data,
      amount: Number(data.amount),
      profileImage: profileImageUrl,
    });
    try {
      if (isEdit && id) {
        await donorApi.update(id, payload);
        toast.success('Donor updated');
      } else {
        await donorApi.create(payload);
        toast.success('Donor created');
      }
      navigate('/donors');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Save failed';
      toast.error(msg);
    }
  };

  const profilePreview = profileUpload.preview || profileImageUrl;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Donor' : 'New Donor'}
        </h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Profile Image Upload */}
          <div>
            <label className="field-label">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center leading-tight px-1">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={profileFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="donor-profile-image-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="donor-profile-image-upload" className="btn-secondary btn btn-sm cursor-pointer">
                  Choose File
                </label>
                {profileUpload.preview && (
                  <button
                    type="button"
                    className="btn-primary btn btn-sm"
                    onClick={handleUpload}
                    disabled={profileUpload.uploading}
                  >
                    {profileUpload.uploading ? 'Uploading…' : 'Upload'}
                  </button>
                )}
                {profilePreview && (
                  <button type="button" className="btn-ghost btn btn-sm text-red-500"
                    onClick={() => { setProfileImageUrl(''); profileUpload.reset(); }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="field-label">Full Name *</label>
            <input
              className="field-input"
              placeholder="Tsering Ngetup Lama"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="field-input" placeholder="donor@example.com" {...register('email')} />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input className="field-input" placeholder="+977 9800000000" {...register('phone')} />
            </div>
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field-input"
                placeholder="25000"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Must be > 0' },
                })}
              />
              {errors.amount && <p className="field-error">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="field-label">Currency</label>
              <input className="field-input" placeholder="NPR" {...register('currency')} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="field-label">Location *</label>
            <input
              className="field-input"
              placeholder="Kathmandu, Nepal"
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && <p className="field-error">{errors.location.message}</p>}
          </div>

          {/* Type + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Donation Type</label>
              <select className="field-input" {...register('type')}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" {...register('date')} />
            </div>
          </div>

          {/* Message / Notes */}
          <div>
            <label className="field-label">Message / Notes</label>
            <textarea
              rows={3}
              className="field-input resize-none"
              placeholder="Supporting education and preserving our cultural heritage."
              {...register('message')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" className="btn-secondary btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Update Donor' : 'Create Donor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
