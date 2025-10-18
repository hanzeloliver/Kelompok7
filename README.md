UMN – Ucup Exploring the Archipelago
Nama Anggota: 



Saviero Alim Pranoto (00000130935)

Proyek ini merupakan game simulasi edukasi berbasis web bertajuk “UMN – Ucup Exploring the Archipelago”. Game ini dikembangkan menggunakan HTML, CSS (TailwindCSS + custom style), dan JavaScript
untuk memberikan pengalaman interaktif kepada pemain dalam menjelajahi berbagai lokasi sambil menjaga status karakter seperti hunger (lapar), sleep (energi), hygiene (kebersihan), dan happiness (kebahagiaan).

Game ini mengusung konsep life simulation sederhana di mana pemain berperan sebagai penjelajah bernama Ucup yang berkeliling dari satu tempat ke tempat lain di dalam peta (Base, Beach, Lake, Temple, dan Mountain). 
Pemain harus mengelola kondisi tubuh karakter agar tidak kehabisan energi dan menghindari kondisi game over.

Program terdiri dari tiga bagian utama:
a.	File HTML
1.	Character Selection Screen : tempat pemain memilih avatar dan memasukkan nama karakter.
2.	Game Screen : tampilan utama permainan yang memuat peta, status karakter, waktu, aktivitas, dan navigasi antar zona.
3.	Game Over Screen : layar yang muncul saat karakter kehabisan energi atau status vital.
HTML ini juga menggunakan TailwindCSS CDN untuk styling cepat dan efisien, serta mengimpor file eksternal style.css dan script.js.

b.	File CSS
File style.css berfungsi mempercantik tampilan dengan menambahkan animasi, efek visual, dan gaya tambahan di luar kemampuan Tailwind.
Beberapa elemen penting pada CSS:
•	Progress Bar System: Menunjukkan status karakter seperti Hunger, Sleep, Hygiene, dan Happiness, dengan warna yang berubah sesuai kondisi (hijau = aman, kuning = sedang, merah = kritis).
•	Tooltip dan Ikon Aktivitas: Menyediakan informasi singkat saat pemain mengarahkan kursor ke aktivitas tertentu.
•	Animasi Shake: Efek guncangan kecil ketika karakter berpindah lokasi di peta.
•	Avatar Selection Frame dan Transition Effect: Memperindah tampilan pemilihan karakter dengan efek interaktif.
•	Game Over Overlay: Menampilkan layar transparan penuh saat game selesai.

c.	File JavaScript
File script.js adalah inti logika permainan.
Fungsi utamanya meliputi:

•	Pemilihan Avatar:
Pemain dapat memilih dari beberapa avatar dengan tombol panah kiri dan kanan. Data avatar disimpan dalam array availableAvatars.
•	Sistem Status Pemain:
Menggunakan objek playerStatus untuk menyimpan nilai hunger, sleep, hygiene, happiness, dan money. Setiap aktivitas akan memengaruhi status ini secara positif atau negatif.
•	Lokasi dan Navigasi:
Lokasi disimpan dalam objek locations yang berisi informasi koordinat dan daftar aktivitas di tiap tempat. Tombol arah (up, down, left, right) digunakan untuk berpindah lokasi. Setiap perpindahan lokasi memicu animasi dan memperbarui aktivitas yang tersedia.
•	Aktivitas:
Setiap aktivitas seperti eat, sleep, clean, work, explore, dan lainnya memiliki efek dan biaya berbeda yang didefinisikan dalam objek activities. Misalnya:
-	eat menambah hunger dan happiness.
-	work mengurangi hygiene dan sleep, namun menambah uang.
-	swim meningkatkan kebahagiaan dan kebersihan, tetapi mengurangi energi.
•	Waktu dan Hari:
Waktu permainan bertambah setiap detik dengan fungsi updateGameTime(). Setiap 10 menit dalam game, kondisi karakter menurun secara bertahap melalui degradeStatus(). Hari akan berganti setelah 24 jam in-game.
•	Sistem Game Over:
Fungsi checkGameOver() memantau status pemain. Jika salah satu status (hunger, sleep, hygiene, atau happiness) mencapai 0, maka permainan berakhir dan layar Game Over akan muncul dengan alasan seperti “starvation”, “exhaustion”, “infection”, atau “despair”.
•	Restart Game:
Pemain dapat memulai ulang game dari awal melalui tombol Restart, yang akan mereset seluruh status, waktu, dan lokasi ke kondisi awal.

Aturan Permainan (Game Rules):
1.	Pemain harus memasukkan nama dan memilih avatar sebelum memulai permainan.
2.	Pemain memulai dari lokasi Base dengan status awal 50% pada semua indikator.
3.	Status karakter akan menurun seiring waktu, sehingga pemain perlu melakukan aktivitas untuk mempertahankannya.
4.	Beberapa aktivitas memiliki biaya uang (money), sementara aktivitas lain dapat memberikan atau mengurangi status tertentu.
5.	Jika salah satu indikator status mencapai 0%, maka permainan berakhir (Game Over).
6.	Pemain dapat berpindah lokasi menggunakan tombol arah dan melakukan aktivitas berbeda di setiap area.
7.	Tujuan utama permainan adalah bertahan hidup selama mungkin dengan menjaga semua status tetap stabil.

Kesimpulan:
Game “UMN – Ucup Exploring the Archipelago” merupakan simulasi ringan yang menggabungkan aspek manajemen waktu, sumber daya, dan kebahagiaan karakter dalam konteks eksplorasi. 
Dengan logika JavaScript yang sistematis dan desain berbasis TailwindCSS, proyek ini berhasil menghadirkan pengalaman bermain yang sederhana namun edukatif. 
Game ini dapat dikembangkan lebih lanjut dengan menambahkan sistem quest, inventory, serta mekanik sosial antar karakter.

Link youtube:

Link OneDrive:

