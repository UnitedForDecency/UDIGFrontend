import { type TokenProp, notifyApiError } from "@/App";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button.tsx";
import { State, City } from "country-state-city";
import type { ICity } from "country-state-city";

type Comment = {
  _id?: string;
  userId: string;
  username: string;
  message: string;
  replies: Reply[];
};

type Reply = {
  _id?: string;
  username: string;
  message: string;
};

type Post = {
  _id: string;
  userId: string;
  username: string;
  title: string;
  state?: string;
  city?: string;
  hyperlink?: string;
  created_at: string;
  description: string;
  likes: string[];
  comments: Comment[];
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

  // NEW: toggle for replies
  const [showAllReplies, setShowAllReplies] = useState(false);

  const replies = comment.replies || [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 1);

  return (
    <div className="text-sm mt-2 ml-0 border-l pl-2">

      {/* COMMENT BODY */}
      <div className="flex justify-between">
        <p>
          <span className="font-semibold">{comment.username}:</span>{" "}
          {comment.message}
        </p>

        <div className="flex gap-2">
          <button
            className="text-blue-500 text-xs underline"
            onClick={() => setActiveReply(currentPath)}
          >
            Reply
          </button>

          {isOwner && (
            <button
              className="text-red-500 text-xs underline"
              onClick={() => handleDeleteComment(postId, comment._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* REPLY INPUT */}
      {isOpen && (
        <div className="mt-1 flex gap-2">
          <input
            value={replyInputs[currentPath] || ""}
            onChange={(e) =>
              setReplyInputs((prev: any) => ({
                ...prev,
                [currentPath]: e.target.value,
              }))
            }
            className="border p-1 text-sm w-full"
            placeholder="Reply..."
          />

          <button
            onClick={() => {
              const msg = replyInputs[currentPath] || "";
              if (!msg.trim()) return;

              handleReply(comment._id, postId, msg);

              setReplyInputs((prev: any) => ({
                ...prev,
                [currentPath]: "",
              }));

              setActiveReply(null);
            }}
            className="text-xs border px-2"
          >
            Send
          </button>
        </div>
      )}

      {/* REPLIES */}
      {replies.length > 0 && (
        <div className="ml-4">
          {visibleReplies.map((child: any) => (
            <CommentNode
              key={child._id}
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
              className="text-xs text-gray-500 mt-1 underline"
              onClick={() => setShowAllReplies((prev) => !prev)}
            >
              {showAllReplies
                ? "View less"
                : `View more (${replies.length - 1})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function SocialMedia({ token }: TokenProp) {
  const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;

  const [posts, setPosts] = useState<Post[]>([]);
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

  // EDIT POST
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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (selectedState) {
      const cityList = City.getCitiesOfState("US", selectedState);
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  useEffect(() => {
  if (editState) {
    const cityList = City.getCitiesOfState("US", editState);
    setCities(cityList);
  }
  }, [editState]);

  useEffect(() => {
    if (filterState) {
      const cityList = City.getCitiesOfState("US", filterState);
      setFilterCities(cityList);
    } else {
      setFilterCities([]);
    }
    setFilterCity("");
  }, [filterState]);




  // -----------------------------------------------------------------------------------------------------------------------------------------------------------






  // FETCH ---------------------------------------------------------------------------------------
  const fetchUserData = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${apiBase}/accounts/token/${token}`);
      setUserId(res.data.userId);
      setUsername(res.data.username || "");
    } catch (err) {
      notifyApiError(err as AxiosError, "fetch user");
    }
  };


  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${apiBase}/social`);

      const postsData = (res.data.posts ?? [])
        .map((p: any): Post => ({
          ...p,
          likes: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
        }))
        .sort((a: Post, b: Post) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setPosts(postsData);
    } catch (err) {
      notifyApiError(err as AxiosError, "fetch posts");
    }
  };


  // Handel ---------------------------------------------------------------------------------------


  // POSTS ----------------------------------------------------------------------
  const handlePost = async () => 
    { 
      if (!titleInput.trim() || !descriptionInput.trim()) return; 
      try { await axios.post(`${apiBase}/social`, 
        { userId, 
          username: username, 
          title: titleInput, 
          state: selectedState || undefined,
          city: selectedCity || undefined, 
          hyperlink: linkInput || undefined, 
          description: descriptionInput, 
          });

          setTitleInput(""); 
          setLinkInput(""); 
          setDescriptionInput(""); 
          setShowModal(false); 

          fetchPosts(); } 
          catch (err) 
          { notifyApiError(err as AxiosError, "create post"); 
      } 
  };


  // Edit Post
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
      await axios.put(`${apiBase}/social/${editingPost._id}`, {
        title: editTitle === "" ? undefined : editTitle,
        state: editState ?? "",
        city: editCity ?? "",
        hyperlink: editLink ?? "",
        description: editDescription === "" ? undefined : editDescription,
      });

      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "update post");
    }
  };



  const handleDeletePost = async () => {
    if (!editingPost) return;

    try {
      await axios.delete(`${apiBase}/social/${editingPost._id}`);

      setPosts((prev) => prev.filter(p => p._id !== editingPost._id));

      setEditingPost(null);
    } catch (err) {
      notifyApiError(err as AxiosError, "delete post");
    }
  };



  const handleReportPost = async () => {
    if (!userId || !reportingPostId) return;

    const post = posts.find((p) => p._id === reportingPostId);
    if (!post) return;

    try {
      await axios.post(`${apiBase}/reports/`, {
        commentId: post._id,
        reporterId: userId,
        reporterName: username || "unknown",
        subjectId: userId,
        subjectName: username,
        content: post.description,
        postedOn: post._id,
        postedOnName: post.title,
        reason: reportMessage,
        category: "post",
      });

      setReportingPostId(null);
      setReportMessage("");
    } catch (err) {
      notifyApiError(err as AxiosError, "report post");
    }
  };

  //Comments ----------------------------------------------------------------------

  const handleComment = async (postId: string) => {
    const message = commentInputs[postId];
    if (!message?.trim()) return;

    try {
      await axios.post(`${apiBase}/social/comment`, {
        userId,
        message,
        postId
      });

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "comment on post");
    }
  };



const handleReply = async (
    commentId: string,
    postId: string,
    message: string,
    path: string
  ) => {
    if (!message?.trim()) return;

    try {
      await axios.post(`${apiBase}/social/reply/${commentId}/${postId}`, {
        userId,
        message,
      });

      setReplyInputs((prev) => ({
        ...prev,
        [path]: "",
      }));
      await fetchPosts();
      setActiveReplyPath(null);

    } catch (err: any) {
      notifyApiError(err as AxiosError, "reply to comment");
    }
  };



  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await axios.delete(`${apiBase}/social/reply/${postId}/${commentId}`);

      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          comments: post.comments.filter((c) => c._id !== commentId),
        }))
      );
      await fetchPosts();
    } catch (err) {
      notifyApiError(err as AxiosError, "delete comment");
    }
  };

  //Likes ----------------------------------------------------------------------

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!userId) return;

    try {
      await axios.post(`${apiBase}/social/like`, {
        postId,
        userId,
      });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
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

  // Filter ----------------------------------------------------------------------

  const handleApplyFilter = async () => {
    try {
      let res;

      if (filterState && filterCity) {
        res = await axios.get(`${apiBase}/social/state/city`, {
          params: {
            state: filterState,
            city: filterCity,
          },
        });
      } else if (filterState) {
        res = await axios.get(`${apiBase}/social/state/${filterState}`, {});
      } else {
        fetchPosts();
        setShowFilterModal(false);
        return;
      }

      const postsData: Post[] = res.data.posts
        .map((p: any) => ({
          ...p,
          likes: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
        }))
        .sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setPosts(postsData);
      setShowFilterModal(false);
    } catch (err: any) {
      console.error(err.message);
      notifyApiError(err as AxiosError, "filter posts");
    }
  };

  //HyperLinks ----------------------------------------------------------------------

  const renderMedia = (url?: string) => {
    if (!url) return null;

    try {
      const parsed = new URL(url.startsWith("http") ? url : "https://" + url);

      if (/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i.test(url)) {
        return <img src={url} className="my-2 w-full rounded" />;
      }

      if (/\.(mp4|webm|ogg)$/i.test(url)) {
        return <video src={url} controls className="my-2 w-full rounded" />;
      }

      if (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be")
      ) {
        const videoId = parsed.hostname.includes("youtube.com")
          ? parsed.searchParams.get("v") || ""
          : parsed.pathname.slice(1);

        return videoId ? (
          <div className="my-2 w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded"
              allowFullScreen
            />
          </div>
        ) : null;
      }

      return (
        <a
          href={url.startsWith("http") ? url : "https://" + url}
          target="_blank"
          rel="noopener noreferrer"
          className="block my-2 p-2 border rounded bg-gray-100 text-blue-600"
        >
          🔗 {url}
        </a>
      );
    } catch {
      return null;
    }
  };









// -----------------------------------------------------------------------------------------------------------------------------------------------------------









  return (
    <div className="min-h-screen flex justify-center p-4 bg-gray-300">
      <div className="w-full max-w-3xl">
        <Card>
          <CardContent>
            <div className="relative">
              {!token && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <p className="text-lg font-semibold text-gray-700">
                    Please log in to view posts
                  </p>
                </div>
              )}

              <div className={`flex flex-col h-[calc(100vh-4rem)] p-4 bg-gray-50 rounded-xl ${!token ? "blur-sm pointer-events-none select-none" : ""}`}>
                <div className="flex justify-between mb-4 items-center">
                  <h2 className="text-xl font-semibold">Discussion</h2>

                  <div className="flex gap-2 items-center">
                    
                    <Button onClick={() => setShowFilterModal(true)}>
                      Filter
                    </Button>

                    <Button onClick={() => setShowModal(true)}>
                      New Post
                    </Button>
                  </div>
                </div>
                {showFilterModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded w-[300px]">

                    <h3 className="font-semibold mb-2">Filter Posts</h3>

                    {/* STATE DROPDOWN */}
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="border w-full p-2 mb-2"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    {/* CITY DROPDOWN */}
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="border w-full p-2 mb-2"
                      disabled={!filterState}
                    >
                      <option value="">All Cities</option>
                      {filterCities.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* ACTIONS */}
                    <div className="flex justify-between mt-3">
                      <Button
                        onClick={() => {
                          setFilterState("");
                          setFilterCity("");
                          setShowFilterModal(false);
                          fetchPosts();
                        }}
                      >
                        Clear
                      </Button>

                      <Button onClick={handleApplyFilter}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}

                <div className="flex-1 overflow-y-auto">
                  {posts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No Posts Available
                    </div>
                  ) : (
                    posts.map((post) => {
                    const liked = post.likes.includes(userId);
                    const isOwner = post.userId === userId;

                    return (
                      <div key={post._id} className="mb-4 p-4 bg-gray-300 border rounded relative pb-10">
                        {/* EDIT BUTTON */}
                        {isOwner && (
                          <button
                            onClick={() => openEditModal(post)}
                            className="absolute top-2 right-2 text-xs underline"
                          >
                            Edit
                          </button>
                        )}

                        <p className="text-xs text-gray-500 text-left">@{post.username}</p>

                        <p className="font-bold">{post.title}</p>

                        {post.city && post.state && (
                          <p className="text-xs text-gray-500">
                            {post.city}, {post.state}
                          </p>
                        )}

                        {renderMedia(post.hyperlink)}

                        <p className="text-sm mt-2">{post.description}</p>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => toggleLike(post._id, liked)}>
                            {liked ? "Unlike" : "Like"} {post.likes.length}
                          </button>

                          <input
                            value={commentInputs[post._id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }))
                            }
                            placeholder="Comment..."
                            className="border p-1 text-sm"
                          />

                          <Button size="sm" onClick={() => handleComment(post._id)}>
                            Send
                          </Button>

                          <button
                            onClick={() => setReportingPostId(post._id)}
                            className="ml-auto text-xs text-red-500 underline"
                          >
                            Report
                          </button>
                        </div>

                        {/* COMMENTS */}
                        <div className="mt-2 border-t pt-2">
                          {post.comments.map((c) => (
                            <CommentNode
                              key={c._id}
                              comment={c}
                              postId={post._id}
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
                      </div>
                    );
                  })
                )}
              </div>

              

                {/* EDIT MODAL */}
                {editingPost && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-4 rounded w-96">
                      <input value={editTitle ?? ""} onChange={(e) => setEditTitle(e.target.value)} className="border w-full p-2 mb-2" />

                      <select
                        value={editState}
                        onChange={(e) => {
                          setEditState(e.target.value);
                        }}
                        className="border w-full p-2 mb-2"
                      >
                        <option value="">Select State (optional)</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="border w-full p-2 mb-2"
                        disabled={!editState}
                      >
                        <option value="">Select City (optional)</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>

                      <input value={editLink ?? ""} onChange={(e) => setEditLink(e.target.value)} placeholder="Link (optional)" className="border w-full p-2 mb-2" />
                      <Textarea value={editDescription ?? ""} onChange={(e) => setEditDescription(e.target.value)} />

                      <div className="flex justify-between mt-2">
                        <Button onClick={handleDeletePost} className="bg-red-500">
                          Delete
                        </Button>

                        <div className="flex gap-2">
                          <Button onClick={() => setEditingPost(null)}>Cancel</Button>
                          <Button onClick={handleUpdatePost}>Save</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREATE POST MODAL */}
                {showModal && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-4 rounded w-96">
                      
                      <input
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="Title"
                        className="border w-full p-2 mb-2"
                      />

                      {/* STATE DROPDOWN */}
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedCity("");
                        }}
                        className="border w-full p-2 mb-2"
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>

                      {/* CITY DROPDOWN */}
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="border w-full p-2 mb-2"
                        disabled={!selectedState}
                      >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>

                      <input
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Link (optional)"
                        className="border w-full p-2 mb-2"
                      />

                      <Textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Description"
                      />

                      <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={handlePost}>
                          Post
                        </Button>

                        <Button onClick={() => setShowModal(false)}>
                          Cancel
                        </Button>
                      </div>

                    </div>
                  </div>
                )}

                {/* REPORT MODAL */}
                {reportingPostId && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-4 rounded w-96">
                      <p className="font-semibold mb-2">Report Post</p>

                      <Textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Why are you reporting this?"
                      />

                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          onClick={() => {
                            setReportingPostId(null);
                            setReportMessage("");
                          }}
                        >
                          Cancel
                        </Button>

                        <Button onClick={handleReportPost}>
                          Submit Report
                        </Button>
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