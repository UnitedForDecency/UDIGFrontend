import { type TokenProp, notifyApiError } from "@/App";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button.tsx";
import { State, City } from "country-state-city";
import type { ICity } from "country-state-city";

const PAGE_SIZE = 30;

type Comment = {
  id?: string;
  userId: string;
  username: string;
  message: string;
  replies: Reply[];
};

type Reply = {
  id?: string;
  username: string;
  message: string;
};

type Post = {
  id: string;
  userId: string;
  username: string;
  title: string;
  state?: string;
  city?: string;
  hyperlink?: string;
  createdAt: string;
  description: string;
  likes: string[];
  comments: Comment[];
  isAdmin?: boolean;
};


const CommentNode = ({
  comment,
  path = "",
  postId,
  username,
  activeReply,
  setActiveReply,
  replyInputs,
  setReplyInputs,
  handleReply,
  handleDeleteComment,
}: any) => {
  const isOwner = comment.username === username;
  const currentPath = `${path}/${comment._id}`;
  const isOpen = activeReply === currentPath;
  const [showAllReplies, setShowAllReplies] = useState(false);
  const replies = comment.replies || [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 1);

  return (
    <div className="text-sm mt-2 ml-0 border-l-2 border-gray-200 pl-3">
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm leading-relaxed break-words [overflow-wrap:anywhere] flex-1">
          <span className="font-semibold text-gray-800">{comment.username}</span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-gray-700">{comment.message}</span>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            className="text-blue-500 text-xs hover:text-blue-700 transition-colors"
            onClick={() => setActiveReply(currentPath)}
          >
            Reply
          </button>
          {isOwner && (
            <button
              className="text-red-400 text-xs hover:text-red-600 transition-colors"
              onClick={() => handleDeleteComment(postId, comment._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-1.5 flex gap-2">
          <input
            value={replyInputs[currentPath] || ""}
            onChange={(e) =>
              setReplyInputs((prev: any) => ({ ...prev, [currentPath]: e.target.value }))
            }
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
            placeholder="Write a reply..."
          />
          <button
            onClick={() => {
              const msg = replyInputs[currentPath] || "";
              if (!msg.trim()) return;
              handleReply(comment._id, postId, msg, currentPath);
              setReplyInputs((prev: any) => ({ ...prev, [currentPath]: "" }));
              setActiveReply(null);
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 transition-colors"
          >
            Send
          </button>
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-3 mt-1">
          {visibleReplies.map((child: any) => (
            <CommentNode
              key={child.id}
              comment={child}
              postId={postId}
              path={currentPath}
              username={username}
              activeReply={activeReply}
              setActiveReply={setActiveReply}
              replyInputs={replyInputs}
              setReplyInputs={setReplyInputs}
              handleReply={handleReply}
              handleDeleteComment={handleDeleteComment}
            />
          ))}
          {replies.length > 1 && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 mt-1 transition-colors"
              onClick={() => setShowAllReplies((prev) => !prev)}
            >
              {showAllReplies ? "↑ View less" : `↓ View ${replies.length - 1} more ${replies.length - 1 === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};


export default function SocialMedia({ token }: TokenProp) {
  const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [titleInput, setTitleInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyPath, setActiveReplyPath] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState("");

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState<null | undefined | string>("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editDescription, setEditDescription] = useState<null | undefined | string>("");

  const states = State.getStatesOfCountry("US");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCities, setFilterCities] = useState<ICity[]>([]);

  // Sort: admin posts first, then by date
  const sortPosts = (posts: Post[]) =>
    [...posts].sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visiblePosts = allPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allPosts.length;

  useEffect(() => { fetchPosts(); }, [token]);
  useEffect(() => { fetchUserData(); }, [token]);

  useEffect(() => {
    if (selectedState) {
      setCities(City.getCitiesOfState("US", selectedState));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (editState) {
      setCities(City.getCitiesOfState("US", editState));
    }
  }, [editState]);

  useEffect(() => {
    if (filterState) {
      setFilterCities(City.getCitiesOfState("US", filterState));
    } else {
      setFilterCities([]);
    }
    setFilterCity("");
  }, [filterState]);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${apiBase}/accounts/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUserId(res.data.id);
      setUsername(res.data.username || "");
    } catch (err) {
      notifyApiError(err as AxiosError, "fetch user");
    }
  };

  const fetchPosts = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`${apiBase}/social`, { headers: { Authorization: `Bearer ${token}` } });
      const postsData = (res.data.posts ?? []).map((p: any): Post => ({
        ...p,
        likes: Array.isArray(p.likes) ? p.likes : [],
        comments: Array.isArray(p.comments) ? p.comments : [],
      }));
      setAllPosts(sortPosts(postsData));
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      notifyApiError(err as AxiosError, "fetch posts");
    }
  };

  const handlePost = async () => {
    if (!titleInput.trim() || !descriptionInput.trim()) return;
    try {
      await axios.post(`${apiBase}/social`, {
        userId,
        username,
        title: titleInput,
        state: selectedState || undefined,
        city: selectedCity || undefined,
        hyperlink: linkInput || undefined,
        description: descriptionInput,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setTitleInput("");
      setLinkInput("");
      setDescriptionInput("");
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "create post");
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditState(post.state || "");
    setEditCity(post.city || "");
    setEditLink(post.hyperlink || "");
    setEditDescription(post.description);
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      await axios.put(`${apiBase}/social/${editingPost.id}`, {
        title: editTitle === "" ? undefined : editTitle,
        state: editState ?? "",
        city: editCity ?? "",
        hyperlink: editLink ?? "",
        description: editDescription === "" ? undefined : editDescription,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "update post");
    }
  };

  const handleDeletePost = async () => {
    if (!editingPost) return;
    try {
      await axios.delete(`${apiBase}/social/${editingPost.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEditingPost(null);
      await fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "delete post");
    }
  };

  const handleReportPost = async () => {
    if (!userId || !reportingPostId) return;
    const post = allPosts.find((p) => p.id === reportingPostId);
    if (!post) return;
    try {
      await axios.post(`${apiBase}/reports`, {
        category: "Social Media Post",
        categoryId: post.id,
        reporterId: userId,
        reason: reportMessage,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReportingPostId(null);
      setReportMessage("");
      alert("Post reported.");
    } catch (err) {
      notifyApiError(err as AxiosError, "report post");
    }
  };

  const handleComment = async (postId: string) => {
    const message = commentInputs[postId];
    if (!message?.trim()) return;
    try {
      await axios.post(`${apiBase}/social/comment`, { userId, message, postId, username }, { headers: { Authorization: `Bearer ${token}` } });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err: any) {
      notifyApiError(err as AxiosError, "comment on post");
    }
  };

  const handleReply = async (commentId: string, postId: string, message: string, path: string) => {
    if (!message?.trim()) return;
    try {
      await axios.post(`${apiBase}/social/reply/${commentId}/${postId}`, { userId, message }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyInputs((prev) => ({ ...prev, [path]: "" }));
      await fetchPosts();
      setActiveReplyPath(null);
    } catch (err: any) {
      notifyApiError(err as AxiosError, "reply to comment");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await axios.delete(`${apiBase}/social/reply/${postId}/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setAllPosts((prev) =>
        prev.map((post) => ({
          ...post,
          comments: post.comments.filter((c) => c.id !== commentId),
        }))
      );
      await fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "delete comment");
    }
  };

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!userId) return;
    try {
      const res = await axios.post(`${apiBase}/social/like`, { postId, userId }, { headers: { Authorization: `Bearer ${token}` } });
      console.log("like response:", res.data); // 👈 check this
      setAllPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: liked
                  ? post.likes.filter((id) => id !== userId)
                  : [...post.likes, userId],
              }
            : post
        )
      );
    } catch (err) {
      notifyApiError(err as AxiosError, "like/unlike post");
    }
  };

  const handleApplyFilter = async () => {
    try {
      let res;
      if (filterState && filterCity) {
        res = await axios.get(`${apiBase}/social/state/city`, {
          params: { state: filterState, city: filterCity },
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (filterState) {
        res = await axios.get(`${apiBase}/social/state/${filterState}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        fetchPosts();
        setShowFilterModal(false);
        return;
      }
      const postsData: Post[] = (res.data.posts ?? []).map((p: any) => ({
        ...p,
        likes: Array.isArray(p.likes) ? p.likes : [],
        comments: Array.isArray(p.comments) ? p.comments : [],
      }));
      setAllPosts(sortPosts(postsData));
      setVisibleCount(PAGE_SIZE);
      setShowFilterModal(false);
    } catch (err: any) {
      notifyApiError(err as AxiosError, "filter posts");
    }
  };

  const renderMedia = (url?: string) => {
    if (!url) return null;
    try {
      const parsed = new URL(url.startsWith("http") ? url : "https://" + url);
      if (/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i.test(url)) {
        return <img src={url} className="mt-3 w-full rounded-xl object-cover max-h-80" />;
      }
      if (/\.(mp4|webm|ogg)$/i.test(url)) {
        return <video src={url} controls className="mt-3 w-full rounded-xl" />;
      }
      if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
        const videoId = parsed.hostname.includes("youtube.com")
          ? parsed.searchParams.get("v") || ""
          : parsed.pathname.slice(1);
        return videoId ? (
          <div className="mt-3 w-full aspect-video rounded-xl overflow-hidden">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen />
          </div>
        ) : null;
      }
      return (
        <a
          href={url.startsWith("http") ? url : "https://" + url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-3 p-2.5 border border-blue-100 rounded-xl bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors"
        >
          🔗 <span className="truncate">{url}</span>
        </a>
      );
    } catch {
      return null;
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const inputClass = "border border-gray-200 rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow bg-white";
  const selectClass = "border border-gray-200 rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow bg-white";

  return (
    <div className="min-h-screen flex justify-center p-4 bg-gray-100">
      <div className="w-full max-w-3xl">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-0">
            <div className="relative">
              {!token && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
                  <p className="text-base font-semibold text-gray-600">Please log in to view posts</p>
                </div>
              )}

              <div className={`flex flex-col h-[calc(100vh-4rem)] bg-gray-50 rounded-xl ${!token ? "blur-sm pointer-events-none select-none" : ""}`}>

                {/* TOP BAR */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-900">Discussion</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowFilterModal(true)}>
                      Filter
                    </Button>
                    <Button size="sm" onClick={() => setShowModal(true)}>
                      + New Post
                    </Button>
                  </div>
                </div>

                {/* FILTER MODAL */}
                {showFilterModal && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-80 shadow-xl">
                      <h3 className="font-semibold text-gray-900 mb-4">Filter Posts</h3>
                      <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className={selectClass}>
                        <option value="">All States</option>
                        {states.map((s) => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                      </select>
                      <div className="mt-2">
                        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className={selectClass} disabled={!filterState}>
                          <option value="">All Cities</option>
                          {filterCities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" onClick={() => { setFilterState(""); setFilterCity(""); setShowFilterModal(false); fetchPosts(); }}>
                          Clear
                        </Button>
                        <Button size="sm" onClick={handleApplyFilter}>Apply</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* POSTS FEED */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {allPosts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No posts yet. Be the first to post!
                    </div>
                  ) : (
                    <>
                      {visiblePosts.map((post) => {
                        const liked = post.likes.includes(userId);
                        const isOwner = post.userId === userId;

                        return (
                          <div
                            key={post.id}
                            className={`bg-white rounded-2xl border p-4 transition-shadow hover:shadow-md ${
                              post.isAdmin
                                ? "border-blue-200 ring-1 ring-blue-100"
                                : "border-gray-200"
                            }`}
                          >
                            {/* POST HEADER */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {post.isAdmin && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                                    📌 Pinned
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">@{post.username}</span>
                                {post.city && post.state && (
                                  <span className="text-xs text-gray-400">· {post.city}, {post.state}</span>
                                )}
                                <span className="text-xs text-gray-400">· {formatDate(post.createdAt)}</span>
                              </div>
                              {isOwner && (
                                <button
                                  onClick={() => openEditModal(post)}
                                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                >
                                  Edit
                                </button>
                              )}
                            </div>

                            {/* TITLE + BODY */}
                            <h3 className="font-semibold text-gray-900 text-base break-words [overflow-wrap:anywhere] leading-snug">
                              {post.title}
                            </h3>

                            {renderMedia(post.hyperlink)}

                            <p className="text-sm text-gray-700 mt-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                              {post.description}
                            </p>

                            {/* ACTION BAR */}
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => toggleLike(post.id, liked)}
                                className={`flex items-center gap-1.5 text-sm transition-colors ${
                                  liked ? "text-red-500 font-medium" : "text-gray-400 hover:text-red-400"
                                }`}
                              >
                                {liked ? "♥" : "♡"} {post.likes.length}
                              </button>

                              <div className="flex flex-1 gap-2">
                                <input
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id); }}
                                  placeholder="Add a comment..."
                                  className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200 transition-shadow"
                                />
                                <Button size="sm" onClick={() => handleComment(post.id)}>
                                  Post
                                </Button>
                              </div>

                              <button
                                onClick={() => setReportingPostId(post.id)}
                                className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                              >
                                Report
                              </button>
                            </div>

                            {/* COMMENTS */}
                            {post.comments.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
                                {post.comments.map((c) => (
                                  <CommentNode
                                    key={c.id}
                                    comment={c}
                                    postId={post.id}
                                    username={username}
                                    activeReply={activeReplyPath}
                                    setActiveReply={setActiveReplyPath}
                                    replyInputs={replyInputs}
                                    setReplyInputs={setReplyInputs}
                                    handleReply={handleReply}
                                    handleDeleteComment={handleDeleteComment}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* LOAD MORE */}
                      {hasMore && (
                        <div className="flex justify-center pt-2 pb-4">
                          <button
                            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white rounded-xl px-5 py-2 transition-colors hover:bg-gray-50"
                          >
                            Load more posts ({allPosts.length - visibleCount} remaining)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* EDIT MODAL */}
                {editingPost && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-xl space-y-2">
                      <h3 className="font-semibold text-gray-900 mb-2">Edit Post</h3>
                      <input value={editTitle ?? ""} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className={inputClass} />
                      <select value={editState} onChange={(e) => setEditState(e.target.value)} className={selectClass}>
                        <option value="">Select State (optional)</option>
                        {states.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
                      </select>
                      <select value={editCity} onChange={(e) => setEditCity(e.target.value)} className={selectClass} disabled={!editState}>
                        <option value="">Select City (optional)</option>
                        {cities.map((city, i) => <option key={i} value={city.name}>{city.name}</option>)}
                      </select>
                      <input value={editLink ?? ""} onChange={(e) => setEditLink(e.target.value)} placeholder="Link (optional)" className={inputClass} />
                      <Textarea value={editDescription ?? ""} onChange={(e) => setEditDescription(e.target.value)} className="rounded-xl" />
                      <div className="flex justify-between pt-2">
                        <Button onClick={handleDeletePost} variant="destructive" size="sm">Delete Post</Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingPost(null)}>Cancel</Button>
                          <Button size="sm" onClick={handleUpdatePost}>Save</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREATE POST MODAL */}
                {showModal && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-xl space-y-2">
                      <h3 className="font-semibold text-gray-900 mb-2">New Post</h3>
                      <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="Title" className={inputClass} />
                      <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }} className={selectClass}>
                        <option value="">Select State (optional)</option>
                        {states.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
                      </select>
                      <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={selectClass} disabled={!selectedState}>
                        <option value="">Select City (optional)</option>
                        {cities.map((city, i) => <option key={i} value={city.name}>{city.name}</option>)}
                      </select>
                      <input value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="Link (optional)" className={inputClass} />
                      <Textarea value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} placeholder="What's on your mind?" className="rounded-xl" />
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={handlePost}>Post</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* REPORT MODAL */}
                {reportingPostId && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-xl space-y-3">
                      <h3 className="font-semibold text-gray-900">Report Post</h3>
                      <Textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Why are you reporting this post?"
                        className="rounded-xl"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setReportingPostId(null); setReportMessage(""); }}>Cancel</Button>
                        <Button size="sm" onClick={handleReportPost}>Submit</Button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}