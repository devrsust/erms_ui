import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Upload, X, PenTool, Stamp } from 'lucide-react'
import { getSignature, getStamp, postSignature, postStamp } from '@/service'
import { useAppSelector } from '@/store/hooks'



export const Route = createFileRoute('/director/stamp/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [stampFile, setStampFile] = useState<File | null>(null)

  const [signatureDragActive, setSignatureDragActive] = useState(false)
  const [stampDragActive, setStampDragActive] = useState(false)

  const { user } = useAppSelector((state) => state.auth);

  // =========================
  // FETCH EXISTING DATA (useQueries)
  // =========================
  const results = useQueries({
    queries: [
      {
        queryKey: ['signature', user?.id],
        queryFn: () => getSignature(user!.id),
      },
      {
        queryKey: ['stamp', user?.id],
        queryFn: () => getStamp(user!.id),
      },
    ],
  })

  const [signatureQuery, stampQuery] = results;

  const signature = signatureQuery?.data
  const stamp = stampQuery?.data

  console.log(signature);


  const handleFileDrop = (
    e: React.DragEvent,
    type: 'signature' | 'stamp',
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]

    if (
      file &&
      ['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)
    ) {
      if (type === 'signature') {
        setSignatureFile(file)
        setSignatureDragActive(false)
      } else {
        setStampFile(file)
        setStampDragActive(false)
      }
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'signature' | 'stamp',
  ) => {
    const file = e.target.files?.[0]

    if (file) {
      if (type === 'signature') {
        setSignatureFile(file)
      } else {
        setStampFile(file)
      }
    }
  }

  const removeFile = (type: 'signature' | 'stamp') => {
    if (type === 'signature') setSignatureFile(null)
    else setStampFile(null)
  }

  // =========================
  // UPLOAD HANDLERS
  // =========================
  const uploadSignature = async () => {
    if (!signatureFile) return
    await postSignature(signatureFile)
    results[0].refetch()
    setSignatureFile(null)
  }

  const uploadStamp = async () => {
    if (!stampFile) return
    await postStamp(stampFile)
    results[1].refetch()
    setStampFile(null)
  }

  const UploadCard = ({
    type,
    title,
    icon: Icon,
    file,
    dragActive,
    setDragActive,
  }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">
            Upload your {title.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="h-44 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
          {file ? (
            <img src={URL.createObjectURL(file)} className="max-h-full" />
          ) : (
            <div className="text-center">
              <Icon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No file selected</p>
            </div>
          )}
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-6"
          style={{
            borderColor: dragActive ? '#0061FE' : '#E5E7EB',
            backgroundColor: dragActive ? '#F5F9FF' : '#fff',
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => handleFileDrop(e, type)}
        >
          <div className="text-center">
            <Upload className="w-5 h-5 text-green-700 mx-auto mb-2" />

            <label className="text-sm text-green-700 cursor-pointer">
              Click to upload
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e, type)}
              />
            </label>
          </div>
        </div>

        {file && (
          <div className="flex justify-between bg-green-50 p-3 rounded-lg">
            <span className="text-sm">{file.name}</span>
            <button onClick={() => removeFile(type)}>
              <X />
            </button>
          </div>
        )}

        <button
          onClick={type === 'signature' ? uploadSignature : uploadStamp}
          className="w-full bg-green-700 text-white py-2 rounded-lg"
        >
          Save {title}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <SiteHeader title="Signature / Stamp" />

      <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border p-5">
              <h3>Current Signature</h3>
              <img
                src={signature?.url || '/images/signature.png'}
                className="h-44"
              />
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3>Current Stamp</h3>
              <img src={stamp?.url || '/images/stamp.png'} className="h-44" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadCard
              type="signature"
              title="Signature"
              icon={PenTool}
              file={signatureFile}
              dragActive={signatureDragActive}
              setDragActive={setSignatureDragActive}
            />

            <UploadCard
              type="stamp"
              title="Stamp"
              icon={Stamp}
              file={stampFile}
              dragActive={stampDragActive}
              setDragActive={setStampDragActive}
            />
          </div>
        </div>
      </main>
    </>
  )
}