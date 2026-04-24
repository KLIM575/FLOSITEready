import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Политика конфиденциальности
        </h1>
        <p className="text-center text-gray-500 mb-10">Последнее обновление: апрель 2026 г.</p>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10">

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Общие положения</h2>
            <p className="text-gray-700 leading-relaxed">
              Настоящая Политика конфиденциальности (далее — «Политика») описывает, как наш интернет-магазин
              (далее — «Магазин», «мы», «нас») собирает, использует, хранит и защищает персональные данные
              пользователей (далее — «Пользователь», «вы»). Используя сайт, вы соглашаетесь с условиями
              данной Политики.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Какие данные мы собираем</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              В процессе работы сайта мы можем собирать следующие категории данных:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><span className="font-medium">Контактные данные:</span> имя, адрес электронной почты, номер телефона — при оформлении заказа или регистрации.</li>
              <li><span className="font-medium">Адрес доставки:</span> город, улица, дом, квартира — для доставки заказа.</li>
              <li><span className="font-medium">Данные об устройстве:</span> IP-адрес, тип браузера, операционная система, страницы посещений — для аналитики и улучшения сервиса.</li>
              <li><span className="font-medium">Cookie-файлы:</span> технические и аналитические файлы cookie — для корректной работы сайта и статистики.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Цели обработки данных</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Мы обрабатываем ваши данные в следующих целях:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Оформление и обработка заказов, уведомление о статусе доставки.</li>
              <li>Идентификация пользователя в личном кабинете.</li>
              <li>Обратная связь и ответы на обращения.</li>
              <li>Улучшение работы сайта и анализ пользовательского поведения.</li>
              <li>Выполнение требований законодательства Российской Федерации.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Файлы cookie</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Сайт использует файлы cookie — небольшие текстовые файлы, сохраняемые в браузере. Cookie помогают нам:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
              <li><span className="font-medium">Необходимые cookie:</span> обеспечивают базовую функциональность (корзина, сессия входа).</li>
              <li><span className="font-medium">Аналитические cookie:</span> позволяют нам понимать, как пользователи взаимодействуют с сайтом.</li>
              <li><span className="font-medium">Функциональные cookie:</span> запоминают ваши предпочтения (например, тёмная тема).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу отдельных функций сайта.
              Посещая сайт, вы даёте согласие на использование cookie в соответствии с данной Политикой.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Передача данных третьим лицам</h2>
            <p className="text-gray-700 leading-relaxed">
              Мы не продаём и не передаём ваши персональные данные третьим лицам без вашего согласия, за исключением
              случаев, предусмотренных законодательством, а также партнёрам, участвующим в обработке вашего заказа
              (службы доставки, платёжные системы). Такие партнёры обязаны соблюдать конфиденциальность и не вправе
              использовать данные в иных целях.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Хранение и защита данных</h2>
            <p className="text-gray-700 leading-relaxed">
              Мы принимаем технические и организационные меры для защиты ваших данных от несанкционированного доступа,
              изменения, раскрытия или уничтожения. Данные хранятся на защищённых серверах. Срок хранения персональных
              данных — не более 3 лет с момента последнего заказа или обращения, либо до отзыва вашего согласия.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Ваши права</h2>
            <p className="text-gray-700 leading-relaxed mb-3">В соответствии с Федеральным законом № 152-ФЗ «О персональных данных» вы вправе:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Получить информацию об обработке ваших персональных данных.</li>
              <li>Потребовать уточнения, блокировки или уничтожения данных.</li>
              <li>Отозвать согласие на обработку персональных данных.</li>
              <li>Обратиться в Роскомнадзор при нарушении ваших прав.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Для реализации прав свяжитесь с нами через{' '}
              <Link to="/contacts" className="text-primary-600 hover:text-primary-700 underline">
                страницу контактов
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Изменения Политики</h2>
            <p className="text-gray-700 leading-relaxed">
              Мы оставляем за собой право вносить изменения в данную Политику. При существенных изменениях мы
              уведомим пользователей путём размещения обновлённой версии на сайте. Рекомендуем периодически
              проверять актуальность документа.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Контакты</h2>
            <p className="text-gray-700 leading-relaxed">
              По вопросам, связанным с обработкой персональных данных, обращайтесь на страницу{' '}
              <Link to="/contacts" className="text-primary-600 hover:text-primary-700 underline">
                Контакты
              </Link>{' '}
              или отправьте письмо на наш электронный адрес.
            </p>
          </section>

        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
