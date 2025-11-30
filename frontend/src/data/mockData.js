// =========================================================
// 1. 임시 데이터 (mockData)
// =========================================================

// 1. 사용자 정보
export const mockUser = {
  email: 'student@kyonggi.ac.kr', 
  university: '경기대학교',
  profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
  name: '클로젯셰어' 
};

// 2. 옷 공유 피드 데이터
export const allMockClosetItems = [
  {
    id: 1,
    title: '봄 트렌치 코트 (M)',
    pricePerDay: 5000,
    imageUrl: 'https://placehold.co/600x600/FFF4E6/FF8C00?text=Trench+Coat',
    description: 'A.P.C. 브랜드의 클래식 트렌치 코트입니다. 사이즈 M (55-66)이고, 상태 최상입니다. 드라이 클리닝 완료.',
    author: '패션루키',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F3E8FF/8A2BE2?text=User1',
    isMine: true, 
    status: 'available', 
    isBookmarked: false, 
  },
  {
    id: 2,
    title: '나이키 빈티지 후드 (L)',
    pricePerDay: 3000,
    imageUrl: 'https://placehold.co/600x600/F0F9FF/007BFF?text=Nike+Hoodie',
    description: '90년대 빈티지 나이키 후드입니다. 오버핏 L 사이즈라 편하게 입기 좋아요. 사용감 조금 있습니다.',
    author: '헌내기코디',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/E2E8F0/A0AEC0?text=User2',
    isMine: false,
    status: 'rented', 
    isBookmarked: true, 
  },
  {
    id: 3,
    title: 'H&M 블랙 드레스 (S)',
    pricePerDay: 4000,
    imageUrl: 'https://placehold.co/600x600/E6FFFA/38B2AC?text=Black+Dress',
    description: '격식 있는 자리에 어울리는 H&M 블랙 드레스입니다. S(44-55) 사이즈, 1회 착용했습니다.',
    author: '스타일쉐어',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F0F9FF/007BFF?text=User3',
    isMine: true, 
    status: 'available',
    isBookmarked: false,
  },
  {
    id: 4,
    title: '자라(ZARA) 크롭 자켓',
    pricePerDay: 4500,
    imageUrl: 'https://placehold.co/600x600/FEFBF3/9D5353?text=Cropped+Jacket',
    description: '올해 구매한 자라 크롭 자켓입니다. 거의 새것. M사이즈.',
    author: '캠퍼스룩',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F3E8FF/8A2BE2?text=User4',
    isMine: false,
    status: 'available',
    isBookmarked: false,
  },
  {
    id: 5,
    title: '리바이스 501 청바지 (30/32)',
    pricePerDay: 3500,
    imageUrl: 'https://placehold.co/600x600/EBF5FB/2980B9?text=Levi+501',
    description: '클래식 리바이스 501. 빈티지샵에서 구매했습니다. 핏 예뻐요.',
    author: '패션루키',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F3E8FF/8A2BE2?text=User1',
    isMine: true,
    status: 'available',
    isBookmarked: true,
  },
  {
    id: 6,
    title: '스투시 반팔 티셔츠 (XL)',
    pricePerDay: 2500,
    imageUrl: 'https://placehold.co/600x600/E8F8F5/16A085?text=Stussy+Tee',
    description: '정품 스투시 반팔. 오버핏으로 입기 좋습니다. 여름에 딱.',
    author: '헌내기코디',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/E2E8F0/A0AEC0?text=User2',
    isMine: false,
    status: 'available',
    isBookmarked: false,
  },
  {
    id: 7,
    title: '아이앱 스튜디오 맨투맨 (L)',
    pricePerDay: 4000,
    imageUrl: 'https://placehold.co/600x600/F4F6F7/7F8C8D?text=IAB+Studio',
    description: '아이앱 스튜디오 크림색 맨투맨. L사이즈. 정품.',
    author: '스타일쉐어',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F0F9FF/007BFF?text=User3',
    isMine: false,
    status: 'rented',
    isBookmarked: false,
  },
  {
    id: 8,
    title: '졸업식 정장 세트 대여 (M)',
    pricePerDay: 10000,
    imageUrl: 'https://placehold.co/600x600/FDFEFE/17202A?text=Suit+Set',
    description: '졸업 사진, 면접용 정장 세트입니다. 자켓+슬랙스+셔츠+넥타이 포함. 1회 착용 후 드라이 완료.',
    author: '졸업반',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F5EEF8/6C3483?text=User5',
    isMine: true,
    status: 'available',
    isBookmarked: true,
  },
  {
    id: 9,
    title: 'MLB 볼캡 (FREE)',
    pricePerDay: 1500,
    imageUrl: 'https://placehold.co/600x600/FBEEE6/C0392B?text=MLB+Cap',
    description: 'MLB LA 다저스 볼캡 네이비 색상입니다. 편하게 쓰고 다니기 좋아요.',
    author: '캠퍼스룩',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F3E8FF/8A2BE2?text=User4',
    isMine: false,
    status: 'available',
    isBookmarked: false,
  },
  {
    id: 10,
    title: '뉴발란스 530 (240)',
    pricePerDay: 3000,
    imageUrl: 'https://placehold.co/600x600/EAFAF1/1D8348?text=NB+530',
    description: '뉴발 530 스틸그레이 240 사이즈. 사용감 살짝 있지만 깨끗하게 신었습니다.',
    author: '패션루키',
    university: '경기대학교',
    profilePic: 'https://placehold.co/50x50/F3E8FF/8A2BE2?text=User1',
    isMine: true,
    status: 'rented',
    isBookmarked: false,
  }
];

// 3. '옷 대상' 쪽지방 데이터
export const mockChatRooms = [
  {
    id: 'admin',
    withUser: '관리자',
    itemId: null,
    itemTitle: '공지사항',
    itemImageUrl: 'https://placehold.co/100x100/E3F2FD/1565C0?text=Notice',
    messages: [
      { sender: '관리자', text: '쪽지를 통해 대여가 된 옷은 해당 게시글에 들어가 대여 상태를 변경하여야 합니다' }
    ]
  },

  {
    id: 'chat1',
    itemId: 1,
    itemTitle: '봄 트렌치 코트 (M)',
    itemImageUrl: 'https://placehold.co/100x100/FFF4E6/FF8C00?text=Coat',
    withUser: '패션루키',
    messages: [
      { sender: '패션루키', text: '네! 물론이죠. 언제쯤 필요하세요?' },
      { sender: 'me', text: '이번 주 금요일에 입고 싶어요.' },
    ],
  },
];

// 4. 내가 대여한 옷 (마이페이지용)
export const mockRentedItems = [
  { id: 2, title: '나이키 빈티지 후드 (L)', returnDate: '2025-11-20', imageUrl: 'https://placehold.co/400x400/F0F9FF/007BFF?text=Nike+Hoodie' },
];

// 5. 옷(아이템)별 댓글 데이터
export const mockClosetItemComments = {
  1: [ { id: 1, author: '궁금해요', text: '혹시 기장이 어느정도 되나요?' } ],
  2: [ { id: 3, author: '문의', text: '사용감 어느정도인지 사진 더 볼 수 있나요?' } ],
  8: [ { id: 4, author: '예약', text: '이번 주 금요일 예약 가능한가요?' } ],
};

// 6. 자유 커뮤니티 게시글 데이터
export const mockSocialPosts = [
  {
    id: 'social1',
    author: '에디터 클로이',
    profilePic: 'https://placehold.co/50x50/E6FFFA/38B2AC?text=E',
    university: '경기대학교',
    createdAt: '3시간 전',
    category: '스타일링 가이드',
    title: '가을 캠퍼스룩 추천! 🍂 5가지 필수 아이템',
    content: '쌀쌀해진 날씨, 뭘 입어야 할지 모르겠다면? 가을 캠퍼스룩 필수템 5가지를 소개합니다. 1. 옥스포드 셔츠 2. 니트 베스트 3. 데님 자켓...',
    imageUrl: 'https://placehold.co/600x400/F9EBEA/D98880?text=Fall+Style+Guide',
    likes: 12,
    isSaved: true, 
  },
  {
    id: 'social2',
    author: '커리어코치',
    profilePic: 'https://placehold.co/50x50/FDF2E9/E67E22?text=C',
    university: '경기대학교',
    createdAt: '1일 전',
    category: '면접 코디',
    title: 'IT 기업 개발자 직무 면접 코디 완벽 가이드',
    content: 'IT 기업 면접, 정장이 답일까? 비즈니스 캐주얼은 어디까지 허용될까? 현직자에게 물어본 직무별/기업별 면접 코디 팁을 공유합니다.',
    imageUrl: 'https://placehold.co/600x400/EBDEF0/8E44AD?text=Interview+Tips',
    likes: 5,
    isSaved: false, 
  },
  {
    id: 'social3',
    author: '졸업반',
    profilePic: 'https://placehold.co/50x50/EBF5FB/2980B9?text=G',
    university: '경기대학교',
    createdAt: '2일 전',
    category: '졸업식 코디',
    title: '학사모 던질 때 인생샷 건지는 졸업식 코디',
    content: '인생샷을 위한 졸업식 코디, 고민 많으시죠? 학사모에 어울리는 원피스/정장 컬러부터 구두 높이까지, 선배들의 꿀팁을 모아봤습니다.',
    imageUrl: 'https://placehold.co/600x400/E8F8F5/16A085?text=Graduation+Outfit',
    likes: 28,
    isSaved: false,
  },
  {
    id: 'social4',
    author: '에디터 클로이',
    profilePic: 'https://placehold.co/50x50/E6FFFA/38B2AC?text=E',
    university: '경기대학교',
    createdAt: '3일 전',
    category: '스타일링 가이드',
    title: 'MBTI 유형별 패션 스타일 분석 (ISTJ, ENFP)',
    content: 'MBTI 유형별로 선호하는 패션 스타일이 다르다는 사실! 오늘은 꼼꼼한 ISTJ와 재기발랄한 ENFP의 패션 스타일을 분석해 봅니다.',
    imageUrl: null,
    likes: 15,
    isSaved: true,
  },
  {
    id: 'social5',
    author: '캠퍼스룩',
    profilePic: 'https://placehold.co/50x50/F5EEF8/6C3483?text=C',
    university: '경기대학교',
    createdAt: '4일 전',
    category: 'OOTD',
    title: '시험 기간 꾸안꾸 도서관룩',
    content: '시험 기간이지만 스타일은 포기할 수 없죠. 편하면서도 예쁜 꾸안꾸 도서관룩 공유합니다. 후드 + 조거팬츠 조합!',
    imageUrl: 'https://placehold.co/600x400/FEFBF3/9D5353?text=Library+Look',
    likes: 9,
    isSaved: false,
  },
  {
    id: 'social6',
    author: '커리어코치',
    profilePic: 'https://placehold.co/50x50/FDF2E9/E67E22?text=C',
    university: '경기대학교',
    createdAt: '5일 전',
    category: '면접 코디',
    title: '면접 1분 자기소개만큼 중요한 첫인상! (헤어/메이크업)',
    content: '복장만큼이나 중요한 면접 헤어/메이크업 팁입니다. 깔끔하고 신뢰감을 주는 인상을 만드는 법!',
    imageUrl: null,
    likes: 11,
    isSaved: false,
  },
];

// 7. 자유 커뮤니티 게시글별 댓글
export const mockSocialComments = {
  'social1': [
    { id: 1, author: '패션루키', text: '오 니트 베스트 정보 궁금해요!' },
    { id: 2, author: '에디터 클로이', text: '@패션루키 정보 공유해드렸습니다!' },
  ],
  'social2': [ { id: 3, author: '헌내기코디', text: '완전 꿀팁... 감사합니다 ㅠㅠ' } ],
  'social3': [ { id: 4, author: '새내기', text: '와 벌써 졸업... 부럽네요. 코디 예뻐요' } ],
};