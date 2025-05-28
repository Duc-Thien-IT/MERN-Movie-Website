using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Cau3;

namespace UNitTest_Cau3
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TC1_ValidData()
        {
            Program pg = new Program();
            int Result_Actual = pg.NchooseR(2, 1);
            int Result_Expect = 2;
            Assert.AreEqual(Result_Expect, Result_Actual);
        }

        [TestMethod]
        public void TC2_ValidData()
        {
            Program pg = new Program();
            int Result_Actual = pg.NchooseR(5, 2);
            int Result_Expect = 10;  
            Assert.AreEqual(Result_Expect, Result_Actual);
        }

        [TestMethod]
        public void TC3_ValidData()
        {
            Program pg = new Program();
            int Result_Actual = pg.NchooseR(5, 5);
            int Result_Expect = 1; 
            Assert.AreEqual(Result_Expect, Result_Actual);
        }

        [TestMethod]
        public void TC4_InvalidData()
        {
            Program pg = new Program();
            int Result_Actual = pg.NchooseR(-1, 2);
            int Result_Expect = 0;  // Kết quả không hợp lệ
            Assert.AreEqual(Result_Expect, Result_Actual);
        }


    }
}
