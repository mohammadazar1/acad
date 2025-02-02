import AddPlayerForm from '../../components/AddPlayerForm'
import { UserPlusIcon } from 'lucide-react'

export default function AddPlayer() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <UserPlusIcon className="mr-2 h-8 w-8" />
            إضافة لاعب جديد
          </h1>
          <div className="hidden sm:block w-24 h-24 bg-white rounded-full overflow-hidden shadow-inner">
            <img src="/placeholder.svg?height=96&width=96" alt="Player Icon" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <AddPlayerForm />
        </div>
      </div>
    </div>
  )
}

