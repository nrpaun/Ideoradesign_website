import { useEffect, useMemo, useState } from 'react';
import logo from './assets/logo.png';
import { projectCategories } from './projectData';
import './admin.css';

const initialImageForm = {
  categorySlug: projectCategories[0].slug,
  title: '',
  imageUrl: '',
  sortOrder: 0
};

const initialHomeImageForm = {
  imageUrl: '',
  quote: ''
};

const initialReviewForm = {
  name: '',
  quote: '',
  rating: 5,
  photoUrl: '',
  sortOrder: 0
};

const sortReviews = (items) => {
  return [...items].sort((first, second) => {
    const firstOrder = Number(first.sort_order ?? 0);
    const secondOrder = Number(second.sort_order ?? 0);

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return Number(first.id ?? 0) - Number(second.id ?? 0);
  });
};

function AdminPage({ onNavigate }) {
  const [contacts, setContacts] = useState([]);
  const [homeImages, setHomeImages] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [homeImageForm, setHomeImageForm] = useState(initialHomeImageForm);
  const [imageForm, setImageForm] = useState(initialImageForm);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHomeImage, setIsSavingHomeImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [notice, setNotice] = useState('');

  const projectImagesByCategory = useMemo(() => {
    return projectCategories.map((category) => ({
      ...category,
      images: projectImages.filter((image) => image.category_slug === category.slug)
    }));
  }, [projectImages]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setNotice('');

    try {
      const [contactsResponse, homeImagesResponse, imagesResponse, reviewsResponse] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/home-images'),
        fetch('/api/project-images'),
        fetch('/api/reviews')
      ]);

      if (!contactsResponse.ok || !homeImagesResponse.ok || !imagesResponse.ok || !reviewsResponse.ok) {
        throw new Error('Unable to load admin data.');
      }

      const [contactsData, homeImagesData, imagesData, reviewsData] = await Promise.all([
        contactsResponse.json(),
        homeImagesResponse.json(),
        imagesResponse.json(),
        reviewsResponse.json()
      ]);

      setContacts(contactsData);
      setHomeImages(homeImagesData);
      setProjectImages(imagesData);
      setReviews(sortReviews(reviewsData));
    } catch (error) {
      setNotice(error.message || 'Unable to load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleImageChange = (event) => {
    const { name, value } = event.target;

    setImageForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHomeImageChange = (event) => {
    const { name, value } = event.target;

    setHomeImageForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewChange = (event) => {
    const { name, value } = event.target;

    setReviewForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setIsSavingReview(true);
    setNotice('');

    try {
      const response = await fetch(editingReviewId ? `/api/reviews/${editingReviewId}` : '/api/reviews', {
        method: editingReviewId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save review.');
      }

      setReviews((prev) => {
        if (editingReviewId) {
          return sortReviews(prev.map((review) => (review.id === editingReviewId ? data.review : review)));
        }

        return sortReviews([...prev, data.review]);
      });
      setReviewForm(initialReviewForm);
      setEditingReviewId(null);
      setNotice(editingReviewId ? 'Review updated.' : 'Review saved. The homepage will show database reviews now.');
    } catch (error) {
      setNotice(error.message || 'Unable to save review.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewForm({
      name: review.name,
      quote: review.quote,
      rating: review.rating,
      photoUrl: review.photo_url || '',
      sortOrder: review.sort_order || 0
    });
    setNotice('');
  };

  const handleCancelReviewEdit = () => {
    setEditingReviewId(null);
    setReviewForm(initialReviewForm);
    setNotice('');
  };

  const handleHomeImageSubmit = async (event) => {
    event.preventDefault();
    setIsSavingHomeImage(true);
    setNotice('');

    try {
      const response = await fetch('/api/home-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(homeImageForm)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save homepage image.');
      }

      setHomeImages((prev) => [...prev, data.image]);
      setHomeImageForm(initialHomeImageForm);
      setNotice('Homepage image saved.');
    } catch (error) {
      setNotice(error.message || 'Unable to save homepage image.');
    } finally {
      setIsSavingHomeImage(false);
    }
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    setIsSavingImage(true);
    setNotice('');

    try {
      // Validation
      if (
        imageForm.categorySlug !== 'details' &&
        !imageForm.title.trim()
      ) {
        throw new Error('Project title is required.');
      }

      const payload = {
        ...imageForm,
        title:
          imageForm.categorySlug === 'details'
            ? ''
            : imageForm.title
      };

      const response = await fetch('/api/project-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save image.');
      }

      setProjectImages((prev) => [...prev, data.image]);

      setImageForm((prev) => ({
        ...initialImageForm,
        categorySlug: prev.categorySlug
      }));

      setNotice('Image saved successfully.');
    } catch (error) {
      setNotice(error.message || 'Unable to save image.');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleDeleteImage = async (id) => {
    setNotice('');

    try {
      const response = await fetch(`/api/project-images/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete image.');
      }

      setProjectImages((prev) => prev.filter((image) => image.id !== id));
      setNotice('Image deleted.');
    } catch (error) {
      setNotice(error.message || 'Unable to delete image.');
    }
  };

  const handleDeleteHomeImage = async (id) => {
    setNotice('');

    try {
      const response = await fetch(`/api/home-images/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete homepage image.');
      }

      setHomeImages((prev) => prev.filter((image) => image.id !== id));
      setNotice('Homepage image deleted.');
    } catch (error) {
      setNotice(error.message || 'Unable to delete homepage image.');
    }
  };

  const handleDeleteReview = async (id) => {
    setNotice('');

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete review.');
      }

      setReviews((prev) => prev.filter((review) => review.id !== id));
      setNotice('Review deleted.');
    } catch (error) {
      setNotice(error.message || 'Unable to delete review.');
    }
  };

  return (
    <div className="admin-route">
      <header className="admin-topbar">
        <a href="/" className="admin-logo" onClick={(event) => onNavigate(event, '/')}>
          <img src={logo} alt="Ideora Design Studio" />
        </a>
        <nav className="admin-nav">
          <a href="/" onClick={(event) => onNavigate(event, '/')}>
            Website
          </a>
          <button type="button" onClick={fetchAdminData}>
            Refresh
          </button>
        </nav>
      </header>

      <main className="admin-page">
        <section className="admin-hero">
          <p>Admin Panel</p>
          <h1>Contacts, Reviews and Images</h1>
        </section>

        {notice && <div className="admin-notice">{notice}</div>}

        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>Contact Entries</h2>
            <span>{contacts.length} total</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5">Loading entries...</td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan="5">No contact entries yet.</td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.email}</td>
                      <td>{contact.message}</td>
                      <td>{new Date(contact.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>Client Reviews</h2>
            <span>{reviews.length} saved</span>
          </div>

          <form className="admin-image-form" onSubmit={handleImageSubmit}>
            {/* Category */}
            <label>
              Category
              <select
                name="categorySlug"
                value={imageForm.categorySlug}
                onChange={handleImageChange}
              >
                {projectCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Hide title field for details category */}
            {imageForm.categorySlug !== 'details' && (
              <label>
                Project title
                <input
                  type="text"
                  name="title"
                  value={imageForm.title}
                  onChange={handleImageChange}
                  placeholder="Project title"
                  required={imageForm.categorySlug !== 'details'}
                />
              </label>
            )}

            {/* Image URL */}
            <label>
              Image URL or path
              <input
                type="text"
                name="imageUrl"
                value={imageForm.imageUrl}
                onChange={handleImageChange}
                placeholder="/images/heroimage1.jpeg"
                required
              />
            </label>

            {/* Sort Order */}
            <label>
              Sort order
              <input
                type="number"
                name="sortOrder"
                value={imageForm.sortOrder}
                onChange={handleImageChange}
                min="0"
              />
            </label>

            <button type="submit" disabled={isSavingImage}>
              {isSavingImage ? 'Saving...' : 'Add Image'}
            </button>
          </form>

          <div className="admin-review-grid">
            {reviews.map((review) => (
              <article key={review.id} className="admin-review-card">
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.rating}/5 rating · Order {review.sort_order}</span>
                </div>
                <p>{review.quote}</p>
                {review.photo_url && <span>{review.photo_url}</span>}
                <div className="admin-review-actions">
                  <button type="button" onClick={() => handleEditReview(review)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteReview(review.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>Homepage Hero Images</h2>
            <span>{homeImages.length} saved</span>
          </div>

          <form className="admin-image-form admin-home-image-form" onSubmit={handleHomeImageSubmit}>
            <label>
              Image URL or path
              <input
                type="text"
                name="imageUrl"
                value={homeImageForm.imageUrl}
                onChange={handleHomeImageChange}
                placeholder="/images/heroimage1.jpeg"
                required
              />
            </label>
            <label>
              Quote
              <input
                type="text"
                name="quote"
                value={homeImageForm.quote}
                onChange={handleHomeImageChange}
                placeholder="Hero slider text"
                required
              />
            </label>
            <button type="submit" disabled={isSavingHomeImage}>
              {isSavingHomeImage ? 'Saving...' : 'Add Hero Image'}
            </button>
          </form>

          <div className="admin-image-grid admin-home-image-grid">
            {homeImages.map((image) => (
              <div key={image.id} className="admin-image-card">
                <img src={image.image_url} alt={image.quote} />
                <div>
                  <strong>{image.quote}</strong>
                  <span>{image.image_url}</span>
                </div>
                <button type="button" onClick={() => handleDeleteHomeImage(image.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading">
            <h2>Project Images</h2>
            <span>{projectImages.length} saved</span>
          </div>

          <form className="admin-image-form" onSubmit={handleImageSubmit}>
            <label>
              Category
              <select name="categorySlug" value={imageForm.categorySlug} onChange={handleImageChange}>
                {projectCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Project title
              <input
                type="text"
                name="title"
                value={imageForm.title}
                onChange={handleImageChange}
                placeholder="Project title"
                required
              />
            </label>
            <label>
              Image URL or path
              <input
                type="text"
                name="imageUrl"
                value={imageForm.imageUrl}
                onChange={handleImageChange}
                placeholder="/images/heroimage1.jpeg"
                required
              />
            </label>
            <label>
              Sort order
              <input
                type="number"
                name="sortOrder"
                value={imageForm.sortOrder}
                onChange={handleImageChange}
                min="0"
              />
            </label>
            <button type="submit" disabled={isSavingImage}>
              {isSavingImage ? 'Saving...' : 'Add Image'}
            </button>
          </form>

          <div className="admin-image-groups">
            {projectImagesByCategory.map((category) => (
              <article key={category.slug} className="admin-image-group">
                <h3>{category.name}</h3>
                {category.images.length === 0 ? (
                  <p>No database images yet. The website is using manual fallback images.</p>
                ) : (
                  <div className="admin-image-grid">
                    {category.images.map((image) => (
                      <div key={image.id} className="admin-image-card">
                        <img src={image.image_url} alt={image.title} />
                        <div>
                          <strong>{image.title}</strong>
                          <span>Order {image.sort_order}</span>
                        </div>
                        <button type="button" onClick={() => handleDeleteImage(image.id)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
