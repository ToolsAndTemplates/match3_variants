import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleJobs = [
  {
    title: 'Satış Menecer',
    description: 'OBA market şəbəkəsində satış meneceri vəzifəsi üzrə işçi axtarılır. Komandamıza qoşulmaq və müştərilərimizə ən yaxşı xidməti göstərmək istəyən enerjili və kommunikativ namizədləri gözləyirik.',
    location: 'Bakı, Nəsimi',
    salary_min: 800,
    salary_max: 1200,
    employment_type: 'full_time',
    requirements: '• Minimum 1 il satış təcrübəsi\n• Əla kommunikasiya bacarıqları\n• Kompüter proqramlarından istifadə bacarığı\n• Məsuliyyətli və nəticəyönlü',
    responsibilities: '• Müştərilərlə işləmək və onlara məsləhət vermək\n• Satış planlarının yerinə yetirilməsi\n• Məhsul sifariş və alışının idarə edilməsi\n• Komanda ilə əməkdaşlıq',
    status: 'active'
  },
  {
    title: 'Kassir',
    description: 'Marketimizin kassir şöbəsinə peşəkar və dəqiq işləyən kassir axtarırıq. Müştəri xidməti sahəsində təcrübəsi olan namizədlərə üstünlük veriləcək.',
    location: 'Bakı, Yasamal',
    salary_min: 600,
    salary_max: 800,
    employment_type: 'full_time',
    requirements: '• Kassir kimi təcrübə (təcrübəsizlərə təlim keçiriləcək)\n• Pul hesablamaqda dəqiqlik\n• Müştəri xidməti bacarıqları\n• Səliqəli və vicdanlı',
    responsibilities: '• Kassa aparatı ilə işləmək\n• Müştərilərə xidmət göstərmək\n• Gündəlik hesabatların hazırlanması\n• Kasanın səliqəli saxlanması',
    status: 'active'
  },
  {
    title: 'Anbar İşçisi',
    description: 'OBA anbarına fiziki cəhətdən güclü və məsuliyyətli anbar işçisi tələb olunur. İş qrafiki 5/2, əlverişli şərait və əmək haqqı.',
    location: 'Bakı, Suraxanı',
    salary_min: 700,
    salary_max: 950,
    employment_type: 'full_time',
    requirements: '• Fiziki cəhətdən güclü olmaq\n• Anbar işində təcrübə (üstünlük)\n• Məsuliyyətli və dəqiq\n• Komandada işləmək bacarığı',
    responsibilities: '• Məhsulların qəbulu və yerləşdirilməsi\n• Anbar inventarizasiyası\n• Yüklərin düzgün saxlanması\n• Sənədləşmə işləri',
    status: 'active'
  },
  {
    title: 'Menecer Köməkçisi',
    description: 'Market idarəçiliyinə köməkçi axtarırıq. Karyer yoluna yeni başlayanlar və inkişaf etmək istəyənlər üçün əla fürsət.',
    location: 'Bakı, Xətai',
    salary_min: 700,
    salary_max: 1000,
    employment_type: 'full_time',
    requirements: '• Ali və ya natamam ali təhsil\n• Kompüter proqramlarından istifadə\n• Öyrənməyə və inkişafa həvəsli\n• Təşkilatçılıq bacarıqları',
    responsibilities: '• Marketin gündəlik işlərinin təşkili\n• Hesabatların hazırlanması\n• Əməkdaşlarla əlaqələndirmə\n• Müştəri şikayətlərinin həlli',
    status: 'active'
  },
  {
    title: 'Satıcı-Məsləhətçi',
    description: 'Müştərilərlə işləməyi sevən, enerjili və kommunikativ satıcı-məsləhətçi axtarırıq. Təcrübəli və təcrübəsiz namizədlər müraciət edə bilərlər.',
    location: 'Bakı, Binəqədi',
    salary_min: 550,
    salary_max: 750,
    employment_type: 'full_time',
    requirements: '• Yaş: 18-35\n• Xoş ünsiyyət qaydaları\n• Dəqiqlik və səliqəlilik\n• Təcrübəsizlərə təlim keçiriləcək',
    responsibilities: '• Müştərilərə məsləhət vermək\n• Məhsulların təqdim edilməsi\n• Ticarət zalının səliqəli saxlanması\n• Satış göstəricilərinin artırılması',
    status: 'active'
  },
  {
    title: 'Marketoloq',
    description: 'OBA market şəbəkəsinin marketinq departamentinə yaradıcı və analitik düşüncəyə malik marketoloq axtarılır.',
    location: 'Bakı, Nərimanov',
    salary_min: 1000,
    salary_max: 1500,
    employment_type: 'full_time',
    requirements: '• Marketinq sahəsində ali təhsil\n• Minimum 2 il təcrübə\n• Sosial media və digital marketinq bilgisi\n• Adobe, Canva və digər dizayn proqramları',
    responsibilities: '• Marketinq strategiyalarının hazırlanması\n• Sosial media hesablarının idarə edilməsi\n• Reklam kampaniyalarının planlaşdırılması\n• Satış artımı üçün təkliflərin hazırlanması',
    status: 'active'
  },
  {
    title: 'Təmizlik İşçisi',
    description: 'Marketimizin təmizlik şöbəsinə səliqəli və məsuliyyətli işçi tələb olunur. İş qrafiki çevik, əmək haqqı vaxtında.',
    location: 'Bakı, Səbail',
    salary_min: 500,
    salary_max: 650,
    employment_type: 'part_time',
    requirements: '• Təmizlik işlərində təcrübə (üstünlük)\n• Səliqəli və dəqiq olmaq\n• Təmizlik vasitələrindən istifadə bacarığı\n• Fiziki işə hazır olmaq',
    responsibilities: '• Ticarət zalının təmizlənməsi\n• Sanitariya normalarına riayət\n• Təmizlik inventarının düzgün istifadəsi\n• Qrafiyə uyğun işləmək',
    status: 'active'
  },
  {
    title: 'İT Mütəxəssis',
    description: 'Market şəbəkəmizin IT infrastrukturunu idarə edəcək texniki mütəxəssis axtarırıq. Texnologiya sevənlər üçün əla fürsət.',
    location: 'Bakı, Nəsimi',
    salary_min: 1200,
    salary_max: 1800,
    employment_type: 'full_time',
    requirements: '• IT sahəsində təhsil və ya sertifikatlar\n• Kompüter və şəbəkə avadanlıqları bilgisi\n• Windows Server, SQL, kasir proqramları\n• Problemləri tez həll etmək bacarığı',
    responsibilities: '• Kompüter və kassa sistemlərinin texniki dəstəyi\n• Şəbəkə infrastrukturunun idarə edilməsi\n• Proqram təminatının quraşdırılması\n• Texniki problemlərin həlli',
    status: 'active'
  },
  {
    title: 'Mühasib',
    description: 'Marketimizin mühasibat şöbəsinə təcrübəli və 1C proqramını bilən mühasib axtarırıq.',
    location: 'Bakı, Yasamal',
    salary_min: 900,
    salary_max: 1300,
    employment_type: 'full_time',
    requirements: '• Mühasibat sahəsində ali təhsil\n• Minimum 2 il mühasib kimi təcrübə\n• 1C proqramını bilmək (mütləq)\n• Excel və digər ofis proqramları',
    responsibilities: '• Gündəlik əməliyyatların uçotu\n• Maliyyə hesabatlarının hazırlanması\n• Vergi və büdcə hesabatları\n• Pul vəsaitlərinə nəzarət',
    status: 'active'
  }
]

async function main() {
  console.log('🌱 Starting database seed...')

  for (const job of sampleJobs) {
    const created = await prisma.jobs.create({
      data: job
    })
    console.log(`✅ Created job: ${created.title} (ID: ${created.id})`)
  }

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
