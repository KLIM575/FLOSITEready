import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Личный кабинет</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Войдите в систему
          </h2>
          <p className="text-gray-600 mb-6">
            Авторизуйтесь, чтобы получить доступ к личному кабинету
          </p>
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Войти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
