import React, { useState, useEffect } from "react";
import { TipTapEditor } from "./TipTapEditor";
const techIconUrl = (name: string) => `https://cdn.jsdelivr.net/npm/tech-stack-icons@3.7.1/images/${name}.svg`;

type TabType = "posts" | "projects" | "products" | "tech" | "experience";

export const CmsDashboard = () => {
	const [activeTab, setActiveTab] = useState<TabType>("posts");
	const [view, setView] = useState<"list" | "edit">("list");
	const [items, setItems] = useState<any[]>([]);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchItems(activeTab);
	}, [activeTab]);

	const fetchItems = async (tab: TabType) => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/${tab}`);
			const data = await res.json();
			setItems(data);
		} catch (e) {
			console.error("Failed to fetch", e);
		}
		setIsLoading(false);
	};

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setView("edit");
	};

	const handleNew = () => {
		setEditingItem({});
		setView("edit");
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this item?")) return;
		try {
			await fetch(`/api/${activeTab}/${id}`, { method: "DELETE" });
			fetchItems(activeTab);
		} catch (e) {
			console.error("Failed to delete", e);
		}
	};

	const handleSave = async () => {
		try {
			const isNew = !editingItem.id;
			const url = isNew ? `/api/${activeTab}` : `/api/${activeTab}/${editingItem.id}`;
			const method = isNew ? "POST" : "PUT";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editingItem),
			});

			if (res.ok) {
				alert("Saved successfully!");
				setView("list");
				fetchItems(activeTab);
			} else {
				const err = await res.json();
				alert("Error saving: " + err.error);
			}
		} catch (e) {
			console.error("Failed to save", e);
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
		if (!e.target.files || e.target.files.length === 0) return;
		const file = e.target.files[0];
		const formData = new FormData();
		formData.append("file", file);

		setIsLoading(true);
		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			if (res.ok) {
				const data = await res.json();
				setEditingItem({ ...editingItem, [field]: data.url });
			} else {
				alert("Upload failed");
			}
		} catch (err) {
			console.error(err);
			alert("Upload error");
		}
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col gap-8">
			{/* Dashboard Header */}
			<div className="flex items-center justify-between pb-4 border-b border-white/10">
				<div>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
						CMS Control Panel
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-white">
						Admin Content Studio
					</h1>
				</div>
				<div className="flex items-center gap-3">
					{view === "edit" ? (
						<>
							<button
								onClick={() => setView("list")}
								className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30"
							>
								Save
							</button>
						</>
					) : (
						<button
							onClick={handleNew}
							className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30"
						>
							+ Create New{" "}
							{activeTab === "tech" ? "Badge" : activeTab === "experience" ? "Role" : activeTab === "products" ? "Product" : activeTab === "posts" ? "Post" : "Project"}
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
				{(["posts", "projects", "products", "tech", "experience"] as TabType[]).map((tab) => (
					<button
						key={tab}
						onClick={() => {
							setActiveTab(tab);
							setView("list");
						}}
						className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
							activeTab === tab
								? "bg-purple-600 text-white"
								: "text-slate-400 hover:text-white hover:bg-white/5"
						}`}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
					</button>
				))}
			</div>

			{/* Content Area */}
			<div>
				{isLoading ? (
					<div className="text-center py-12 text-slate-400">Loading...</div>
				) : view === "list" ? (
					<div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
						<table className="w-full text-left text-sm text-slate-300">
							<thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
								<tr>
									<th className="px-6 py-4">Title / Name</th>
									<th className="px-6 py-4">Status / Info</th>
									<th className="px-6 py-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/10">
								{items.length === 0 ? (
									<tr>
										<td colSpan={3} className="px-6 py-8 text-center text-slate-500">
											No {activeTab} found. Click "Create New" to add one!
										</td>
									</tr>
								) : (
									items.map((item) => (
										<tr key={item.id} className="hover:bg-white/5 transition-colors">
											<td className="px-6 py-4 font-medium text-white">
												{activeTab === "experience" ? editingItem?.role || item.role : item.title || item.name}
											</td>
											<td className="px-6 py-4">
												{activeTab === "posts" && (
													<span
														className={`px-2 py-1 rounded text-xs ${item.published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
													>
														{item.published ? "Published" : "Draft"}
													</span>
												)}
												{(activeTab === "projects" || activeTab === "products") && (
													<span
														className={`px-2 py-1 rounded text-xs ${item.featured ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-500/20 text-slate-400"}`}
													>
														{item.featured ? "Featured" : "Standard"}
													</span>
												)}
												{activeTab === "tech" && (
													<span className="text-slate-400 text-xs">{item.category}</span>
												)}
												{activeTab === "experience" && (
													<span className="text-slate-400 text-xs">{item.company}</span>
												)}
											</td>
											<td className="px-6 py-4 text-right space-x-3">
												<button
													onClick={() => handleEdit(item)}
													className="text-purple-400 hover:text-purple-300 font-semibold text-xs"
												>
													Edit
												</button>
												<button
													onClick={() => handleDelete(item.id)}
													className="text-red-400 hover:text-red-300 font-semibold text-xs"
												>
													Delete
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 flex flex-col gap-6">
							<div className="glass-panel rounded-2xl p-6 border border-white/10">
								<label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
									{activeTab === "tech" ? "Name" : activeTab === "experience" ? "Role Title" : "Title"}
								</label>
								<input
									type="text"
									value={editingItem.title || editingItem.name || editingItem.role || ""}
									onChange={(e) =>
										setEditingItem({
											...editingItem,
											[activeTab === "tech" ? "name" : activeTab === "experience" ? "role" : "title"]: e.target.value,
										})
									}
									placeholder={`Enter ${activeTab} title...`}
									className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-lg font-bold"
								/>
							</div>

							{activeTab === "experience" && (
								<div className="glass-panel rounded-2xl p-6 border border-white/10 grid grid-cols-2 gap-4">
									<div className="col-span-2">
										<label className="block text-xs font-semibold text-slate-400 mb-1">Company</label>
										<input type="text" value={editingItem.company || ""} onChange={e => setEditingItem({...editingItem, company: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200" />
									</div>
									<div>
										<label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
										<input type="text" value={editingItem.startDate || ""} onChange={e => setEditingItem({...editingItem, startDate: e.target.value})} placeholder="e.g. Jan 2022" className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200" />
									</div>
									<div>
										<label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
										<input type="text" value={editingItem.endDate || ""} onChange={e => setEditingItem({...editingItem, endDate: e.target.value})} placeholder="e.g. Present" className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200" />
									</div>
								</div>
							)}

							{(activeTab === "posts" || activeTab === "projects" || activeTab === "products" || activeTab === "experience") && (
								<div className="glass-panel rounded-2xl p-6 border border-white/10">
									<label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
										{activeTab === "experience" ? "Responsibilities" : "Content"}
									</label>
									<TipTapEditor
										content={editingItem.content || editingItem.description || ""}
										onChange={(html) => setEditingItem({ ...editingItem, [activeTab === "experience" ? "description" : "content"]: html })}
									/>
								</div>
							)}
						</div>

						<div className="flex flex-col gap-6">
							<div className="glass-panel rounded-2xl p-6 border border-white/10">
								<h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/10">
									Settings
								</h3>

								<div className="flex flex-col gap-4">
									{activeTab !== "tech" && activeTab !== "experience" && (
										<>
											<div>
												<label className="block text-xs font-semibold text-slate-400 mb-1">
													Slug
												</label>
												<input
													type="text"
													value={editingItem.slug || ""}
													onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
												/>
											</div>
											<div>
												<label className="block text-xs font-semibold text-slate-400 mb-1">
													{activeTab === "posts" ? "Excerpt" : "Description"}
												</label>
												<textarea
													rows={3}
													value={editingItem.excerpt || editingItem.description || ""}
													onChange={(e) =>
														setEditingItem({
															...editingItem,
															[activeTab === "posts" ? "excerpt" : "description"]: e.target.value,
														})
													}
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
												/>
											</div>
										</>
									)}

									{activeTab === "tech" && (
										<div>
											<label className="block text-xs font-semibold text-slate-400 mb-1">
												Category
											</label>
											<input
												type="text"
												value={editingItem.category || ""}
												onChange={(e) =>
													setEditingItem({ ...editingItem, category: e.target.value })
												}
												placeholder="e.g. Frontend, Backend, Tooling..."
												className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
											/>
										</div>
									)}

									{activeTab !== "experience" && (
										<div>
											<label className="block text-xs font-semibold text-slate-400 mb-1">
												{activeTab === "tech" ? "Icon Name (e.g. 'react') or Image URL" : "Cover Image URL"}
											</label>
											<div className="flex items-center gap-2">
												<input
													type="text"
													value={editingItem.coverImage || editingItem.icon || ""}
													onChange={(e) =>
														setEditingItem({
															...editingItem,
															[activeTab === "tech" ? "icon" : "coverImage"]: e.target.value,
														})
													}
													placeholder={activeTab === "tech" ? "e.g. 'react', 'typescript', or https://..." : "https://..."}
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
												/>
												<label className="shrink-0 cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-semibold text-white transition-colors">
													Upload
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) =>
															handleImageUpload(e, activeTab === "tech" ? "icon" : "coverImage")
														}
													/>
												</label>
											</div>
											{(editingItem.coverImage || editingItem.icon) && (
												<div className="mt-2 relative rounded-lg overflow-hidden border border-white/10 h-24 bg-black/50 flex items-center justify-center">
													{activeTab === "tech" && editingItem.icon && !editingItem.icon.includes('/') && !editingItem.icon.startsWith('http') ? (
														<img src={techIconUrl(editingItem.icon)} alt={editingItem.icon} className="h-12 w-12 object-contain" />
													) : (
														<img
															src={editingItem.coverImage || editingItem.icon}
															alt="Preview"
															className="max-h-full max-w-full object-contain"
														/>
													)}
												</div>
											)}
										</div>
									)}

									{(activeTab === "projects" || activeTab === "products") && (
										<>
											<div>
												<label className="block text-xs font-semibold text-slate-400 mb-1">
													Year
												</label>
												<input
													type="text"
													value={editingItem.year || ""}
													onChange={(e) =>
														setEditingItem({ ...editingItem, year: e.target.value })
													}
													placeholder="e.g. 2026"
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
												/>
											</div>
											<div>
												<label className="block text-xs font-semibold text-slate-400 mb-1">
													Demo/Product URL
												</label>
												<input
													type="text"
													value={editingItem.demoUrl || ""}
													onChange={(e) =>
														setEditingItem({ ...editingItem, demoUrl: e.target.value })
													}
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
												/>
											</div>
											<div>
												<label className="block text-xs font-semibold text-slate-400 mb-1">
													GitHub URL
												</label>
												<input
													type="text"
													value={editingItem.githubUrl || ""}
													onChange={(e) =>
														setEditingItem({ ...editingItem, githubUrl: e.target.value })
													}
													className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
												/>
											</div>
										</>
									)}
									{activeTab === "products" && (
										<div>
											<label className="block text-xs font-semibold text-slate-400 mb-1">
												Visitors Count
											</label>
											<input
												type="number"
												value={editingItem.visitors || 0}
												onChange={(e) =>
													setEditingItem({ ...editingItem, visitors: parseInt(e.target.value) })
												}
												className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
											/>
										</div>
									)}

									<div className="pt-4 border-t border-white/10">
										<label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
											<input
												type="checkbox"
												checked={!!(editingItem.published || editingItem.featured)}
												onChange={(e) =>
													setEditingItem({
														...editingItem,
														[activeTab === "posts" ? "published" : "featured"]: e.target.checked,
													})
												}
												className="rounded border-white/20 bg-black/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
											/>
											{activeTab === "posts"
												? "Publish Post"
												: activeTab === "projects"
													? "Featured Project"
													: activeTab === "products"
														? "Featured Product"
														: "Active"}
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
