
import { supabase, isSupabaseConfigured } from './supabaseClient';

export { supabase, isSupabaseConfigured };

/**
 * Helper to convert File to Base64 string for storage in TEXT columns
 * (Note: In production, use Supabase Storage buckets instead of DB columns)
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// --- HOSTELS ---

export const fetchHostels = async (city) => {
    if (!isSupabaseConfigured()) return [];

    // 1. Fetch Hostels
    const { data: hostelsData, error } = await supabase
        .from('hostels')
        .select('*')
        .ilike('city', `%${city}%`);

    if (error || !hostelsData) {
        console.error("Error fetching hostels:", error);
        return [];
    }

    // 2. Fetch Room Types for these hostels
    const hostelIds = hostelsData.map(h => h.id);
    const { data: roomsData } = await supabase
        .from('room_types')
        .select('*')
        .in('hostel_id', hostelIds);

    // 3. Map to Interface
    return hostelsData.map(h => ({
        id: h.id,
        name: h.name,
        type: h.type || 'PG',
        currency: '₹',
        distance: h.address ? 'Near Campus' : 'Unknown', // Ideally calc distance
        rating: Number(h.rating) || 0,
        reviewCount: 0, // Will update when fetching reviews detail
        verified: h.verified,
        amenities: h.amenities || [],
        images: h.images || ['https://picsum.photos/400/300'], // Fallback
        description: h.description,
        address: h.address,
        contact: { phone: h.contact_phone, email: h.contact_email },
        coordinates: { lat: h.lat || 0, lng: h.lng || 0 },
        roomTypes: roomsData?.filter(r => r.hostel_id === h.id).map(r => ({
            type: r.type,
            price: r.price,
            description: r.description
        })) || [],
        listed_since: h.listed_since
    }));
};

// --- REVIEWS ---

export const fetchReviews = async (hostelId) => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            profiles:user_id (name, verified)
        `)
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

    if (error) return [];

    return data.map(r => ({
        id: r.id,
        hostel_id: r.hostel_id,
        user_id: r.user_id,
        rating: r.rating,
        text: r.text,
        created_at: r.created_at,
        images: r.images,
        author: {
            name: r.profiles?.name || 'Unknown',
            verified: r.profiles?.verified || false
        }
    }));
};

export const postReview = async (review) => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('reviews').insert(review);
    if (error) console.error("Error posting review", error);
    return error;
};

// --- HOSTEL Q&A ---

export const fetchHostelQuestions = async (hostelId) => {
    if (!isSupabaseConfigured()) return [];

    // Fetch Questions
    const { data: questions, error } = await supabase
        .from('hostel_questions')
        .select(`
            *,
            profiles:user_id (name, verified)
        `)
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

    if (error || !questions) return [];

    // Fetch Answers for these questions
    const qIds = questions.map(q => q.id);
    const { data: answers } = await supabase
        .from('hostel_answers')
        .select(`
            *,
            profiles:user_id (name, verified)
        `)
        .in('question_id', qIds)
        .order('created_at', { ascending: true });

    // Map structure
    return questions.map(q => ({
        id: q.id,
        hostel_id: q.hostel_id,
        user_id: q.user_id,
        question: q.question,
        image_url: q.image_url,
        created_at: q.created_at,
        author: {
            name: q.profiles?.name || 'User',
            verified: q.profiles?.verified || false
        },
        answers: answers?.filter(a => a.question_id === q.id).map(a => ({
            id: a.id,
            user_id: a.user_id,
            answer: a.answer,
            created_at: a.created_at,
            author: {
                name: a.profiles?.name || 'User',
                verified: a.profiles?.verified || false
            }
        })) || []
    }));
};

export const postQuestion = async (q) => {
    return await supabase.from('hostel_questions').insert(q);
};

export const postAnswer = async (a) => {
    return await supabase.from('hostel_answers').insert(a);
};


// --- COMMUNITY FEED ---

export const fetchCommunityPosts = async () => {
    if (!isSupabaseConfigured()) return [];

    // Fetch Posts
    const { data: posts, error } = await supabase
        .from('community_posts')
        .select(`
            *,
            profiles:user_id (name, verified, college)
        `)
        .order('created_at', { ascending: false });

    if (error || !posts) return [];

    // Fetch Comments
    const pIds = posts.map(p => p.id);
    const { data: comments } = await supabase
        .from('community_comments')
        .select(`
            *,
            profiles:user_id (name, verified, college)
        `)
        .in('post_id', pIds);

    return posts.map(p => {
        const postComments = comments?.filter(c => c.post_id === p.id) || [];
        return {
            id: p.id,
            user_id: p.user_id,
            topic: p.topic,
            content: p.content,
            tags: p.tags || [],
            image_url: p.image_url,
            created_at: p.created_at,
            author: {
                name: p.profiles?.name || 'User',
                verified: p.profiles?.verified || false,
                college: p.profiles?.college || ''
            },
            comments: postComments.map(c => ({
                id: c.id,
                post_id: c.post_id,
                user_id: c.user_id,
                content: c.content,
                created_at: c.created_at,
                author: {
                    name: c.profiles?.name || 'User',
                    verified: c.profiles?.verified || false,
                    college: c.profiles?.college || ''
                }
            })),
            comment_count: postComments.length
        };
    });
};

export const createCommunityPost = async (post) => {
    return await supabase.from('community_posts').insert(post);
};

export const createCommunityComment = async (comment) => {
    return await supabase.from('community_comments').insert(comment);
};
