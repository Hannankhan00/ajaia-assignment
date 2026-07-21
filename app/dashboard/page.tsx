import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import NewDocumentButton from "./NewDocumentButton";
import UploadDocumentButton from "./UploadDocumentButton";
import DocumentCard from "./DocumentCard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab === "shared" ? "shared" : "my";

  const [ownedDocuments, sharedDocumentsResult] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.documentShare.findMany({
      where: { userId },
      include: { document: true },
      orderBy: { document: { updatedAt: "desc" } },
    }),
  ]);

  const sharedDocuments = sharedDocumentsResult.map((s: any) => s.document);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* Google Docs Style Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Docs</h1>
        </div>
        
        <div className="flex-1 max-w-2xl px-8 hidden md:block">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-gray-100 text-black px-10 py-3 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white shadow-inner transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 border-white">
            U
          </div>
        </div>
      </header>

      {/* Start a new document section */}
      <section className="bg-gray-100 border-b border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Start a new document</h2>
            <span className="text-sm font-medium text-gray-500">Supports .txt and .md files only</span>
          </div>
          <div className="flex gap-4">
            {/* Blank Document Card */}
            <div className="flex flex-col">
              <div className="w-40 h-52 bg-white border-2 border-gray-200 hover:border-orange-500 rounded flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative">
                {/* Visual representation of a blank page */}
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform z-10">
                  <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                {/* Invisible wrapper for the NewDocumentButton so it covers the card without affecting layout */}
                <div className="absolute inset-0 opacity-0">
                  <NewDocumentButton className="w-full h-full" />
                </div>
              </div>
              <span className="text-sm font-bold text-black mt-2">Blank</span>
            </div>

            {/* Upload Document Card */}
            <div className="flex flex-col">
              <UploadDocumentButton />
              <span className="text-sm font-bold text-black mt-2">Upload File</span>
            </div>
            
            {/* Template placeholder 1 */}
            <div className="flex flex-col opacity-75">
              <div className="w-40 h-52 bg-white border-2 border-gray-200 rounded flex flex-col p-3 cursor-not-allowed overflow-hidden">
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded mb-1"></div>
                <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
              </div>
              <span className="text-sm font-bold text-gray-700 mt-2">Resume</span>
            </div>

            {/* Template placeholder 2 */}
            <div className="flex flex-col opacity-75 hidden sm:flex">
              <div className="w-40 h-52 bg-white border-2 border-gray-200 rounded flex flex-col p-3 cursor-not-allowed overflow-hidden">
                <div className="h-10 w-full bg-gradient-to-r from-yellow-100 to-orange-100 rounded mb-2"></div>
                <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
              </div>
              <span className="text-sm font-bold text-gray-700 mt-2">Letter</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Documents section */}
      <section className="flex-1 bg-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-black">Recent documents</h2>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <Link
                href="/dashboard?tab=my"
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                  activeTab === "my"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Owned by anyone
              </Link>
              <Link
                href="/dashboard?tab=shared"
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                  activeTab === "shared"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Shared with me
              </Link>
            </div>
          </div>

          <div className="pb-12">
            {activeTab === "my" && (
              <div>
                {ownedDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <p className="text-base font-medium text-gray-500">No text documents yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {ownedDocuments.map((doc: any) => (
                      <DocumentCard key={doc.id} doc={doc} isOwner={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "shared" && (
              <div>
                {sharedDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <p className="text-base font-medium text-gray-500">No shared documents yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sharedDocuments.map((doc: any) => (
                      <DocumentCard key={doc.id} doc={doc} isOwner={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
