// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image";
// import TextStyle from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import TextAlign from "@tiptap/extension-text-align";
// import FontFamily from "@tiptap/extension-font-family";
// import FontSize from "@tiptap/extension-font-size";
// import Link from "@tiptap/extension-link";
// import { useState } from "react";

// const EmailEditor = () => {
//   const [imageUrl, setImageUrl] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Image,
//       TextStyle,
//       Color,
//       TextAlign.configure({ types: ["heading", "paragraph"] }),
//       FontFamily,
//       FontSize.configure({ types: ["textStyle"] }),
//       Link.configure({ openOnClick: true }),
//     ],
//     content: "<p>Start writing your email...</p>",
//   });

//   if (!editor) return null;

//   const addImage = () => {
//     if (imageUrl) {
//       editor.chain().focus().setImage({ src: imageUrl }).run();
//       setImageUrl("");
//     }
//   };

//   const addLocalImage = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         editor.chain().focus().setImage({ src: reader.result }).run();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const addLink = () => {
//     if (linkUrl) {
//       editor.chain().focus().setLink({ href: linkUrl, target: "_blank" }).run();
//       setLinkUrl("");
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
//       {/* Toolbar */}
//       <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-100 rounded-lg">
//         <button
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700"
//         >
//           Bold
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-700"
//         >
//           Italic
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleUnderline().run()}
//           className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-700"
//         >
//           Underline
//         </button>
//         <input
//           type="color"
//           onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
//           title="Text Color"
//           className="w-10 h-10 border border-gray-300 rounded-md"
//         />
//         <select
//           onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
//           className="p-1 border border-gray-300 rounded-md"
//         >
//           <option value="Arial">Arial</option>
//           <option value="Georgia">Georgia</option>
//           <option value="Courier New">Courier New</option>
//           <option value="Times New Roman">Times New Roman</option>
//           <option value="Verdana">Verdana</option>
//         </select>
//         <input
//           type="number"
//           min="8"
//           max="72"
//           onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
//           placeholder="Font Size"
//           className="p-1 w-16 border border-gray-300 rounded-md"
//         />

//         {/* Image Upload */}
//         <input
//           type="text"
//           placeholder="Image URL"
//           value={imageUrl}
//           onChange={(e) => setImageUrl(e.target.value)}
//           className="p-1 border border-gray-300 rounded-md"
//         />
//         <button
//           onClick={addImage}
//           className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-700"
//         >
//           Add Image
//         </button>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={addLocalImage}
//           className="p-1 border border-gray-300 rounded-md"
//         />

//         {/* Link Input */}
//         <input
//           type="text"
//           placeholder="Insert Link"
//           value={linkUrl}
//           onChange={(e) => setLinkUrl(e.target.value)}
//           className="p-1 border border-gray-300 rounded-md"
//         />
//         <button
//           onClick={addLink}
//           className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-700"
//         >
//           Add Link
//         </button>

//         {/* Text Transform Options */}
//         <button
//           onClick={() => editor.chain().focus().toggleUppercase().run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Uppercase
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleLowercase().run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Lowercase
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleCapitalized().run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Capitalize
//         </button>

//         {/* Text Alignment */}
//         <button
//           onClick={() => editor.chain().focus().setTextAlign("left").run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Left
//         </button>
//         <button
//           onClick={() => editor.chain().focus().setTextAlign("center").run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Center
//         </button>
//         <button
//           onClick={() => editor.chain().focus().setTextAlign("right").run()}
//           className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
//         >
//           Right
//         </button>
//       </div>

//       {/* Editor */}
//       <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[200px]">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// };

// export default EmailEditor;
