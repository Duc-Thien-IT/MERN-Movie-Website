//using NUnit.Framework;
//using Cau3;

//namespace NUnitTest_Cau3
//{
//    [TestFixture]
//    public class UnitTest1
//    {
//        private Program pg;

//        [SetUp]
//        public void Setup()
//        {
//            pg = new Program();
//        }

//        [Test]
//        public void TC1_ValidData()
//        {
//            int resultActual = pg.NchooseR(4, 2);
//            int resultExpect = 6;
//            Assert.AreEqual(resultExpect, resultActual);
//        }

//        [Test]
//        public void TC2_ValidData()
//        {
//            int resultActual = pg.NchooseR(5, 2);
//            int resultExpect = 10;
//            Assert.AreEqual(resultExpect, resultActual);
//        }

//        [Test]
//        public void TC3_ValidData()
//        {
//            int resultActual = pg.NchooseR(5, 5);
//            int resultExpect = 1;
//            Assert.AreEqual(resultExpect, resultActual);
//        }

//        [Test]
//        public void TC4_InvalidData()
//        {
//            int resultActual = pg.NchooseR(-1, 2);
//            int resultExpect = 0;  // Kết quả không hợp lệ
//            Assert.AreEqual(resultExpect, resultActual);
//        }
//    }
//}
